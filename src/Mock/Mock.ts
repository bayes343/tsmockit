import { Times } from './Times';
import { SignatureService } from './SignatureService';
import { FunctionMap } from './FunctionMap';
import { SignatureMap } from './SignatureMap';

export class Mock<T> {
  private memberSignatureMaps = new Array<SignatureMap>();

  private object: T = {} as T;
  public get Object(): T {
    return this.object;
  }

  private setup(member: (func: T) => any, returns: any = null, exactSignatureMatch = true): void {
    const memberSignatureMap = SignatureService.GetMemberSignatureMap(member, returns, exactSignatureMatch);
    this.updateMemberSignatureMaps(memberSignatureMap);

    const memberName = SignatureService.GetMemberNameFromSignature(memberSignatureMap.signature);
    if (SignatureService.MemberSignatureIsProperty(memberSignatureMap.signature)) {
      (this.object as any)[memberName] = this.getReturnsValueForProperty(memberSignatureMap);
    } else {
      (this.object as any)[memberName] = ((...args: any) => {
        return this.getReturnsForFunction(memberSignatureMap, args, exactSignatureMatch)?.();
      });
    }
  }

  public Setup(member: (func: T) => any, returns: any = null): void {
    this.setup(member, returns);
  }

  public SetupDefault(member: (func: T) => any, returns: any = null): void {
    this.setup(member, returns, false);
  }

  public TimesMemberCalled(member: (func: T) => any): number {
    const memberSignature = SignatureService.GetMemberSignatureMap(member);
    const functionMap: FunctionMap | undefined = this.getFunctionMapFromSignatureMap(memberSignature);
    const timesCalled = functionMap ? functionMap.timesCalled : 0;

    return timesCalled;
  }

  public Verify(member: (func: T) => any, times: Times | number): void {
    const timesCalled = this.TimesMemberCalled(member);

    expect(timesCalled).toEqual(times);
  }

  private getReturnsValueForProperty(memberSignatureMap: SignatureMap): any {
    let value = null;
    const existingMemberSignatureMap = this.memberSignatureMaps.find(s => s.signature === memberSignatureMap.signature);

    if (existingMemberSignatureMap) {
      value = existingMemberSignatureMap.functionMaps[0] ? existingMemberSignatureMap.functionMaps[0].returns : null;
    }

    return value;
  }

  private getReturnsForFunction(
    memberSignatureMap: SignatureMap,
    args: any,
    exactSignatureMatch: boolean
  ): Function | undefined {
    const existingMemberSignatureMap = this.memberSignatureMaps.find(
      s => s.signature === memberSignatureMap.signature);
    const exactFunctionMap = existingMemberSignatureMap?.functionMaps.find(
      m => JSON.stringify(m.state) === JSON.stringify(args));
    const defaultFunctionMap = exactSignatureMatch ? undefined : existingMemberSignatureMap?.functionMaps.find(m => m.default);

    const functionMap = exactFunctionMap || defaultFunctionMap;

    return functionMap ? (() => {
      functionMap.timesCalled++;
      return functionMap.returns;
    }) : undefined;
  }

  private updateMemberSignatureMaps(memberSignatureMap: SignatureMap) {
    const existingSignatureMap = this.memberSignatureMaps.find(m => m.signature === memberSignatureMap.signature);

    const newFunctionMap = memberSignatureMap.functionMaps[0];

    if (existingSignatureMap && newFunctionMap) {
      this.updateSignatureMapFunctions(existingSignatureMap, newFunctionMap);
    } else {
      this.memberSignatureMaps.push(memberSignatureMap);
    }
  }

  private updateSignatureMapFunctions(existingSignatureMap: SignatureMap, newFunctionMap: FunctionMap) {
    const existingFunctionMap = existingSignatureMap.functionMaps.find(
      fm => JSON.stringify(fm.state) === JSON.stringify(newFunctionMap.state));

    if (existingFunctionMap) {
      const functionMaps = existingSignatureMap.functionMaps;
      functionMaps.splice(functionMaps.indexOf(existingFunctionMap), 1, newFunctionMap);
    } else {
      existingSignatureMap.functionMaps.push(newFunctionMap);
    }
  }

  private getFunctionMapFromSignatureMap(memberSignature: SignatureMap): FunctionMap | undefined {
    const existingMember = this.memberSignatureMaps.find(m => m.signature === memberSignature.signature);
    const functionMapToFind = memberSignature.functionMaps[0];

    return existingMember?.functionMaps.find(
      m => JSON.stringify(m.state) === JSON.stringify(functionMapToFind.state)) ||
      existingMember?.functionMaps.find(m => m.default);
  }
}
