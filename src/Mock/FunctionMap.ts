export type FunctionMap = {
  state: (string | Function)[],
  returns: Function,
  timesCalled: number,
  singleUse: boolean,
  originalSignature: string | undefined
};
