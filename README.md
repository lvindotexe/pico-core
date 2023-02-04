# @lvindotex/pico

This is my tiny react clone i built in order to get a better understanding of Reactjs. its based of https://pomb.us/build-your-own-react/.

#### TODO

- useContext
- maybe a statemanager like zustand

# Installation

right now the framework only works on vite create a vanilla Javascipt/TypeScript project with [vite](https://vitejs.dev/)

replace script src in `index.html` from `/src/main.ts` to `/src/main.tsx`

install react types, and the react plugin for jsx support

```
pnpm i -D  @vitejs/plugin-react
```

create a `vite.config.ts`

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: "classic",
    }),
  ],
});
```

replace `main.ts` with `main.tsx` run `npm run dev` and you should be good to go

```tsx
import {
  useState,
  createRoot,
  useMemo,
  createPicoElement,
} from "@lvindotexe/pico";

/** @jsx createPicoElement */
function Counter() {
  const [state, setState] = useState(1);

  return (
    <div>
      <h1 className="text-2xl font-bold">The count is {state}</h1>
      <button
        className="font-bold"
        onclick={() => setState((prev) => prev + 1)}
      >
        increment
      </button>
    </div>
  );
}

const root = document.getElementById("app")!;
createRoot(root).render(<Counter />);
```

# Hooks

work the same way as react hooks, right now ive only implemented; useState,useEffect,and useMemo. next hooks i plan to support will be useReducer, and useContext.

pico only supports functional components and I've no intention to support class components. props are supported in the same ways as react.

## useState

is a reactive primitive that allows users to set variables and objects that change over time. calling the `useState` function returns a tuple that contains the value of the state, and a setter, to change the state of the value

```tsx
import { useState, createPicoElement } from "@lvindotexe/pico";

function Counter() {
  const [state, setState] = useState(1);
  return (
    <div>
      <h1 className="text-2xl font-bold">
        The sum is {state} and {result}
      </h1>
      <button
        className="font-bold"
        onclick={() => setState((prevState) => prev + 1)}
      >
        increment
      </button>
    </div>
  );
}
```

## useEffect

useEffect allows use to run specific actions when state changes.heres an example of a clock. Remember to cleanup event listeners and timers

```tsx
function Counter() {
  const [state, setState] = useState(Date.now());

  useEffect(() => {
    let timer = setTimeout(() => setState((prev) => Date.now()), 1000);
    return () => clearTimeout(timer);
  });
  return (
    <div>
      <h1 className="text-2xl font-bold">The time is {state}</h1>
    </div>
  );
}
```

## useMemo

allows you cache the result of a calculation between re-renders. results are only recomputed when dependancies change.

```tsx
function Counter({
  initial,
  incrementBy,
}: {
  initial: number;
  incrementBy: number;
}) {
  const [state, setState] = useState(initial);
  const result = useMemo(() => state + incrementBy, [state]);

  return (
    <div>
      <h1 className="text-2xl font-bold">
        {state} and {result}
      </h1>
      <button
        className="font-bold"
        onclick={() => setState((prev) => prev + 1)}
      >
        increment
      </button>
    </div>
  );
}
```

## useReducer

Makes it easier to manage complex state logic when the next state is dependant on the previous state.

```tsx
import { useReducer } from "@lvindotexe/pico";

const initialState = 0;
const reducer = (state, action) => {
  switch (action) {
    case "increment":
      return state + 1;
    case "decrement":
      return state - 1;
    case "reset":
      return 0;
    default:
      throw new Error("Unexpected action");
  }
};

function Counter() {
  // Returns the current state and a dispatch function to
  // trigger an action
  const [count, dispatch] = useReducer(reducer, initialState);
  return (
    <div>
      {count}
      <button onClick={() => dispatch("increment")}>+1</button>
      <button onClick={() => dispatch("decrement")}>-1</button>
      <button onClick={() => dispatch("reset")}>reset</button>
    </div>
  );
}
```

## useContext
