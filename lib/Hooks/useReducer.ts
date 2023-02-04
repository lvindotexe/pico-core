import { PicoState } from "../picoState";
import { Fiber } from "../types";

type Reducer<T, A> = (initial: T, action: A) => T;
type ReducerState<R extends Reducer<any, any>> = R extends Reducer<infer S, any>
  ? S
  : never;

type ReducerAction<R extends Reducer<any, any>> = R extends Reducer<
  any,
  infer A
>
  ? A
  : never;
type Dispatch<A> = (state: A) => void;

export const useReducer = <T, A>(
  inital: T,
  reducer: Reducer<T, A>
): readonly [
  ReducerState<Reducer<T, A>>,
  Dispatch<ReducerAction<Reducer<T, A>>>
] => {
  type Action = (state: T) => T;
  type ReducerHook = {
    state: T;
    queue: Array<Action>;
  };

  const oldHook: ReducerHook | undefined =
    PicoState.wipFiber &&
    PicoState.wipFiber.alternate &&
    PicoState.wipFiber.alternate.hooks &&
    PicoState.wipFiber.alternate.hooks[PicoState.hookIndex];

  const hook: ReducerHook = {
    state: oldHook ? oldHook.state : inital,
    queue: new Array(),
  };

  const actions = oldHook ? oldHook.queue : [];
  actions.forEach((action) => (hook.state = action(hook.state)));

  const dispatch: Dispatch<ReducerAction<Reducer<T, A>>> = (action) => {
    const actionCallback: Action = (state) => {
      return reducer(state, action);
    };
    hook.queue.push(actionCallback);

    PicoState.wipRoot = {
      dom: PicoState.currentRoot!.dom,
      props: PicoState.currentRoot!.props,
      alternate: PicoState.currentRoot,
    };
    PicoState.nextUnitOfWork = PicoState.wipRoot as Fiber;
    PicoState.deletions = [];
  };

  //@ts-ignore
  PicoState.wipFiber.hooks.push(hook);
  PicoState.hookIndex++;

  return [hook.state, dispatch] as const;
};
