import { useEffect } from "./Hooks/useEffect";
import { useMemo } from "./Hooks/useMemo";
import { useReducer } from "./Hooks/useReducer";
import { useState } from "./Hooks/useState";
import { PicoState } from "./picoState";
import { PicoElement, PicoTextElement, Fiber } from "./types";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export {
  createPicoElement,
  useState,
  useEffect,
  useMemo,
  createRoot,
  useReducer,
  Pico,
};

const Pico = {
  createPicoElement,
  createRoot,
  render,
};
function createPicoElement(
  type: string,
  props?: any,
  ...children: any[] | string[]
): PicoElement {
  return {
    type,
    props: {
      ...props,
      children: children.map((e) =>
        typeof e === "object" ? e : createTextElement(e)
      ),
    },
  };
}

function createTextElement(text: string | number): PicoTextElement {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function createRoot(container: HTMLElement) {
  PicoState.wipRoot = {
    dom: container,
    //references old fiber
    alternate: PicoState.currentRoot,
  };
  PicoState.deletions = new Array();
  PicoState.nextUnitOfWork = PicoState.wipRoot as Fiber;
  return {
    render: (element: PicoElement) => {
      PicoState.wipRoot!.props = { children: [element] };
      window.requestIdleCallback(workLoop);
    },
  };
}

function render(element: PicoElement, container: HTMLElement | Text) {
  PicoState.wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    //references old fiber
    alternate: PicoState.currentRoot,
  };
  PicoState.deletions = new Array();
  PicoState.nextUnitOfWork = PicoState.wipRoot as Fiber;
}

function workLoop(deadline: IdleDeadline) {
  let shouldYield = false;
  while (PicoState.nextUnitOfWork && !shouldYield) {
    PicoState.nextUnitOfWork = performUnitOfWork(PicoState.nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  if (!PicoState.nextUnitOfWork && PicoState.wipRoot) {
    commitRoot();
  }
  window.requestIdleCallback(workLoop);
}

function createDom(fiber: Fiber) {
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : !(fiber.type instanceof Function)
      ? document.createElement(fiber.type)
      : null;
  if (dom === null)
    throw `fiber of ${fiber.type}, should not be able to be called here`;
  Object.keys(fiber.props)
    .filter((k) => k !== "children")
    .forEach((k) => (dom[k] = fiber.props[k]));
  updateProperties(dom, {}, fiber.props);
  return dom;
}

function performUnitOfWork(fiber: Fiber) {
  if (fiber.type instanceof Function) updateFunctionComponent(fiber);
  else updateHostComponent(fiber);
  //search for the next unit of work and return it,first child, sibling, then parent
  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling;
    nextFiber = nextFiber.parent as Fiber;
  }
  return null;
}

function updateFunctionComponent(fiber: Fiber) {
  PicoState.wipFiber = fiber;
  PicoState.hookIndex = 0;
  PicoState.wipFiber.hooks = [];

  if (fiber.type instanceof Function) {
    const children = [fiber.type(fiber.props)];
    reconcileChildren(fiber, children);
  }
}

function updateHostComponent(fiber: Fiber) {
  if (!fiber.dom) fiber.dom = createDom(fiber);
  reconcileChildren(fiber, fiber.props.children);
}

function reconcileChildren(fiber: Fiber, elements: any) {
  let index = 0;
  let oldFiber = fiber.alternate && fiber.alternate.child;
  let prevSibling: Fiber | null = null;

  while (index < elements.length || oldFiber != null) {
    const element = elements[index];
    let newFiber: Fiber | null = null;

    const sameType = oldFiber && element && element.type == oldFiber.type;

    if (sameType) {
      newFiber = {
        //@ts-ignore
        type: oldFiber ? oldFiber.type : null,
        props: element.props,
        dom: oldFiber ? oldFiber.dom : null,
        parent: fiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      };
    }
    if (element && !sameType) {
      //@ts-ignore
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: fiber,
        alternate: null,
        effectTag: "PLACE",
      };
    }
    if (oldFiber && !sameType) {
      oldFiber.effectTag = "DELETE";
      PicoState.deletions?.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      fiber.child = newFiber;
    } else if (element && prevSibling) {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}

function commitRoot() {
  //add nodes to dom
  PicoState.deletions?.forEach(commitWork);
  commitWork(PicoState.wipRoot as Fiber | null);
  PicoState.currentRoot = PicoState.wipRoot as Fiber;
  PicoState.wipRoot = null;
}

function commitWork(fiber: Fiber | null) {
  if (!fiber) return;
  let domParentFiber = fiber.parent;

  while (domParentFiber && !domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const parentDom = domParentFiber ? domParentFiber.dom : null;
  if (fiber.effectTag === "PLACE" && fiber.dom != null && parentDom) {
    parentDom.appendChild(fiber.dom);
  }
  if (fiber.effectTag === "DELETE" && parentDom)
    commitDeletion(fiber, parentDom);
  if (fiber.effectTag === "UPDATE" && fiber.alternate && fiber.dom != null)
    updateProperties(fiber.dom, fiber.alternate.props, fiber.props);
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

const isProperty = (key: string) => key !== "children" && !isEvent(key);
const isNew = (prev: Fiber["props"], next: Fiber["props"]) => (key: string) =>
  prev[key] !== next[key];
const isGone = (next: Fiber["props"]) => (key: string) => !(key in next);
const isEvent = (key: string) => key.startsWith("on");

function commitDeletion(fiber: Fiber, domParent: NonNullable<Fiber["dom"]>) {
  if (fiber.dom) domParent.removeChild(fiber.dom);
  else if (fiber.child) commitDeletion(fiber.child, domParent);
}

function updateProperties(
  dom: HTMLElement | Text,
  prevProps: Fiber["props"],
  nextProps: Fiber["props"]
) {
  //remove old event handlers from the dom
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((e) => {
      const eventType = e.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[e]);
    });

  //add new EventHandlers
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((e) => {
      const eventType = e.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[e]);
    });

  //removes old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(nextProps))
    .forEach((e) => (dom[e] = ""));

  //updates new props
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((e) => (dom[e] = nextProps[e]));
}
