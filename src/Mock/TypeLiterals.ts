export type FunctionMap = {
  default: boolean,
  state: string,
  returns: Function,
  timesCalled: number
};

export type SignatureMap = {
  signature: string,
  functionMaps: Array<FunctionMap>
};
