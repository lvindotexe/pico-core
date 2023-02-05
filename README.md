# @lvindotex/pico

This is my tiny react clone i built in order to get a better understanding of Reactjs. its based of https://pomb.us/build-your-own-react/.

# Installation

right now the framework only works on vite create a vanilla Javascipt/TypeScript project with [vite](https://vitejs.dev/)

```
pnpm i @lvindotexe/pico @vitejs/plugin-react
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

replace script src in `index.html` from `/src/main.ts` to `/src/main.tsx`

replace `main.ts` with `main.tsx`, here is an example of a counter

```tsx
import { useState, createRoot, useMemo, Pico } from "@lvindotexe/pico";

/** @jsx Pico.createPicoElement */
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
Pico.createRoot(root).render(<Counter />);
```

run `npm run dev` and you should be good to go

# Hooks

work the same way as react hooks, right now ive only implemented; useState,useEffect,and useMemo. next hooks i plan to support will be useReducer, and useContext.

pico only supports functional components and I've no intention to support class components. props are supported in the same ways as react.

## useState

is a reactive primitive that allows users to set variables and objects that change over time. calling the `useState` function returns a tuple that contains the value of the state, and a setter, to change the state of the value

```tsx
import { useState } from "@lvindotexe/pico";

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
import { useEffect } from "@lvindotexe/pico";

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
import { useMemo } from "@lvindotexe/pico";

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
function reducer(state: number, action: "inc" | "dec") {
  switch (action) {
    case "inc":
      return state + 1;
    case "dec":
      return state - 1;
    default:
      throw "";
  }
}

function Counter() {
  const [state, dispatch] = useReducer(1, reducer);

  return (
    <div>
      <h1 className="text-2xl">The count is {state}</h1>
      <button className="font-bold" onclick={() => dispatch("inc")}>
        increment
      </button>
      <button className="font-bold" onclick={() => dispatch("dec")}>
        decrement
      </button>
    </div>
  );
}
```

## useContext

# TODO

- fix useState triggering twice when called for the first time
- refractor lib to look less of a didact clone
- useContext
- maybe a statemanager like zustand
