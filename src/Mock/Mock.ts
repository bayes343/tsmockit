import { Times } from './Times';
import { SignatureService } from './SignatureService';
import { FunctionMap } from './FunctionMap';
import { SignatureMap } from './SignatureMap';
import { ANY_VALUE } from './Any';

export class Mock<T> {
  private memberSignatureMaps = new Array<SignatureMap>();

  private object: T = {} as T;
  public get Object(): T {
    return this.object;
  }

  private setup(member: (func: T) => any, returns: any = null, exactSignatureMatch = true, singleUse = false): void {
    const memberSignatureMap = SignatureService.GetMemberSignatureMap(member, returns, exactSignatureMatch, singleUse);
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

  public SetupOnce(member: (func: T) => any, returns: any = null): void {
    this.setup(member, returns, true, true);
  }

  public SetupSequence(setups: [(func: T) => any, any][]): void {
    setups.forEach(setup => {
      this.setup(setup[0], setup[1], true, true);
    });
  }

  public TimesMemberCalled(member: (func: T) => any): number {
    const memberSignatureMap = SignatureService.GetMemberSignatureMap(member);
    const functionMap: FunctionMap | undefined = this.getFunctionMapFromSignatureMap(memberSignatureMap);

    return functionMap ? functionMap.timesCalled : 0;
  }

  public Verify(member: (func: T) => any, times: Times | number): void {
    const timesCalled = this.TimesMemberCalled(member);
    const signature = SignatureService.GetMemberSignatureMap(member).signature;
    const memberSignatureMap = this.memberSignatureMaps.find(m => m.signature === signature);

    if (timesCalled !== times) {
      console.log(`Actual calls made for, "${signature}:`,
        memberSignatureMap?.functionMaps.map(m => `${m.originalSignature} x ${m.timesCalled}`))
    }

    expect(timesCalled).toEqual(times, timesCalled !== times ? `` : undefined);
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
    const { functionMap, functionMaps } = this.getFunctionMapsFromSignature(memberSignatureMap, args, exactSignatureMatch);

    return functionMap ? (() => {
      functionMap.timesCalled++;
      if (functionMaps && functionMap.singleUse) {
        const indexToDelete = functionMaps.indexOf(functionMap);
        functionMaps.splice(indexToDelete, 1);
      }
      return functionMap.returns;
    }) : undefined;
  }

  private getFunctionMapsFromSignature(memberSignatureMap: SignatureMap, args: string[], exactSignatureMatch: boolean) {
    const existingMemberSignatureMap = this.memberSignatureMaps.find(
      s => s.signature === memberSignatureMap.signature);
    const functionMaps = existingMemberSignatureMap?.functionMaps;

    let exactFunctionMap = functionMaps?.find(m => JSON.stringify(m.state) === JSON.stringify(args));
    const defaultFunctionMap = exactSignatureMatch ? undefined : functionMaps?.find(m => m.default);
    const functionMapsUsingAny = functionMaps?.filter(m => m.state.includes(ANY_VALUE));

    if (functionMapsUsingAny?.length) {
      functionMapsUsingAny.forEach(element => {
        if (!exactFunctionMap) {
          const state = element.state as unknown as string[];
          let anyTransposedState: string[] = [];
          args.forEach((a, i) => {
            anyTransposedState[i] = state[i] === ANY_VALUE ? ANY_VALUE : a;
          });
          exactFunctionMap = functionMaps?.find(m => JSON.stringify(m.state) === JSON.stringify(anyTransposedState));
          console.log(args, state, anyTransposedState, exactFunctionMap);
        }
      });
    }

    const functionMap = exactFunctionMap || defaultFunctionMap;
    return { functionMap, functionMaps };
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

    if (existingFunctionMap && !newFunctionMap.singleUse) {
      const functionMaps = existingSignatureMap.functionMaps;
      functionMaps.splice(functionMaps.indexOf(existingFunctionMap), 1, newFunctionMap);
    } else {
      existingSignatureMap.functionMaps.push(newFunctionMap);
    }
  }

  private getFunctionMapFromSignatureMap(memberSignature: SignatureMap): FunctionMap | undefined {
    const existingMemberSignatureMap = this.memberSignatureMaps.find(m => m.signature === memberSignature.signature);
    const functionMapToFind = memberSignature.functionMaps[0];

    return existingMemberSignatureMap?.functionMaps.find(
      m => JSON.stringify(m.state) === JSON.stringify(functionMapToFind.state)) ||
      existingMemberSignatureMap?.functionMaps.find(m => m.default);
  }
}
