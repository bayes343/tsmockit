export type FunctionMap = {
  state: string | string[],
  returns: Function,
  timesCalled: number,
  singleUse: boolean,
  originalSignature: string | undefined
};
