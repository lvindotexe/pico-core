export type PicoElement = {
  type: string;
  props: any & { children: any[] };
};

export type PicoTextElement = {
  type: 'TEXT_ELEMENT';
  props: {
    nodeValue: string | number;
    children: [];
  };
};

export type Fiber = {
  type: string | Function | 'TEXT_ELEMENT';
  props: { children: [] } & any;
  dom: HTMLElement | Text | null;
  parent: Fiber | null;
  child: Fiber | null;
  sibling: Fiber | null;
  alternate: Fiber | null;
  effectTag: 'UPDATE' | 'DELETE' | 'PLACE' | null;
  hooks: any[];
};

export type WipRoot = Partial<Fiber>;

export type CoreState = {
  wipRoot: WipRoot | null;
  currentRoot: Fiber | null;
  deletions: Fiber[];
  wipFiber: Fiber | null;
  nextUnitOfWork: Fiber | null;
  hookIndex: number;
};
