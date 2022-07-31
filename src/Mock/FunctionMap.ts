export type FunctionMap = {
  default: boolean,
  state: string,
  returns: Function,
  timesCalled: number,
  singleUse: boolean,
  originalSignature: string | undefined
};
