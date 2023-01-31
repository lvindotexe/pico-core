import { PicoState } from '../picoState';
import { isEqual } from '../utils';
type useEffectCallback = () => void;
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

  if (!oldHook || !oldHook.deps) {
    console.log('effect');
    cb();
  } else if (!isEqual(oldHook.deps, hook.deps)) cb();

  //@ts-ignore
  PicoState.wipFiber.hooks.push(hook);
  PicoState.hookIndex++;
}
