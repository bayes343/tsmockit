export type FunctionMap = {
  state: string | string[] | Function[],
  returns: Function,
  timesCalled: number,
  singleUse: boolean,
  originalSignature: string | undefined
};
