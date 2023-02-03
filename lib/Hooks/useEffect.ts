import { PicoState } from "../picoState";
import { isEqual } from "../utils";
type useEffectCallback = () => void | (() => () => void);
type useEffectHook = {
  deps: Array<any> | undefined;
};
export function useEffect(cb: useEffectCallback, deps?: any[]) {
  const oldHook: useEffectHook =
    PicoState.wipFiber &&
    PicoState.wipFiber.alternate &&
    PicoState.wipFiber.alternate.hooks &&
    PicoState.wipFiber.alternate.hooks[PicoState.hookIndex];

  const hook: useEffectHook = {
    deps,
  };
  let cleanup: ReturnType<useEffectCallback>;
  if (!oldHook || !oldHook.deps) {
    console.log("effect");
    cleanup = cb();
  } else if (!isEqual(oldHook.deps, hook.deps)) cleanup = cb();

  if (cleanup) cleanup();
  //@ts-ignore
  PicoState.wipFiber.hooks.push(hook);
  PicoState.hookIndex++;
}
