import { PicoState } from '../picoState';
import { isEqual } from '../utils';
type Computed<T> = () => T;
type NOnEmptyArray<T> = [T, ...T[]];

export function useMemo<T>(computed: Computed<T>, deps: NOnEmptyArray<any>) {
  type UseMemoHook = {
    computed: T | null;
    deps: Array<any> | undefined;
  };
  const oldHook: UseMemoHook =
    PicoState.wipFiber &&
    PicoState.wipFiber.alternate &&
    PicoState.wipFiber.alternate.hooks &&
    PicoState.wipFiber.alternate.hooks[PicoState.hookIndex];

  const hook: UseMemoHook = {
    computed: null,
    deps,
  };

  if (!oldHook) hook.computed = computed();
  else if (!isEqual(hook.deps, oldHook.deps)) hook.computed = computed();

  //@ts-ignore
  PicoState.wipFiber.hooks.push(hook);
  PicoState.hookIndex++;
  return hook.computed as T;
}
