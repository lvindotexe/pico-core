import { PicoState } from '../picoState';
import { Fiber } from '../types';

export function useState<T>(initial: T) {
  type SetStateAction = (prev: T) => T;
  type StateHook = {
    state: T;
    queue: Array<SetStateAction>;
  };
  const oldHook =
    PicoState.wipFiber &&
    PicoState.wipFiber.alternate &&
    PicoState.wipFiber.alternate.hooks &&
    PicoState.wipFiber.alternate.hooks[PicoState.hookIndex];
  const hook: StateHook = {
    state: oldHook ? oldHook.state : initial,
    queue: new Array<SetStateAction>(),
  };

  const actions = oldHook ? oldHook.queue : [];

  actions.forEach((action) => (hook.state = action(hook.state)));

  function setState(setStateAction: SetStateAction) {
    hook.queue.push(setStateAction);

    PicoState.wipRoot = {
      dom: PicoState.currentRoot!.dom,
      props: PicoState.currentRoot!.props,
      alternate: PicoState.currentRoot,
    };
    PicoState.nextUnitOfWork = PicoState.wipRoot as Fiber;
    PicoState.deletions = [];
  }

  //@ts-ignore
  PicoState.wipFiber.hooks.push(hook);
  PicoState.hookIndex++;

  return [hook.state, setState] as const;
}
