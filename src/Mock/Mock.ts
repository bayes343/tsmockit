import { Times } from './Times';
import { SignatureService } from './SignatureService';
import { FunctionMap } from './FunctionMap';
import { SignatureMap } from './SignatureMap';
import { ANY_VALUE } from './Any';

export class Mock<T> {
  private memberSignatureMaps = new Array<SignatureMap>();
  private object: T = {} as T;
  /**
   * The mock object of the given type "T" to inject as a substitute to a concrete implementation
   */
  public get Object(): T {
    return this.object;
  }

  /**
   * Configure what the mock object will return when a given member is accessed
   * @param member
   * @param returns
   */
  public Setup(member: (func: T) => any, returns: any = null): void {
    this.setup(member, returns);
  }

  /**
   * Configure a setup that will only resolve on the first time the member is registered
   * @param member
   * @param returns
   */
  public SetupOnce(member: (func: T) => any, returns: any = null): void {
    this.setup(member, returns, true);
  }

  /**
   * Configure a set of setups that will only resolve on the first time the member is registered
   * @param setups
   */
  public SetupSequence(setups: [(func: T) => any, any][]): void {
    setups.forEach(setup => {
      this.SetupOnce(setup[0], setup[1]);
    });
  }

  /**
   * Return the number of times a given member was referenced
   * @param member
   * @returns
   */
  public TimesMemberCalled(member: (func: T) => any): number {
    const memberSignatureMap = SignatureService.GetMemberSignatureMap(member);
    const functionMap: FunctionMap | undefined = this.getFunctionMapsFromSignature(
      memberSignatureMap, memberSignatureMap.functionMaps[0]?.state as any).functionMapForArgs;

    return functionMap?.timesCalled || 0;
  }

  /**
   * Make an assertion that a given member was referenced a given number of times
   * @param member
   * @param times
   */
  public Verify(member: (func: T) => any, times: Times | number): void {
    const timesCalled = this.TimesMemberCalled(member);
    const signature = SignatureService.GetMemberSignatureMap(member).signature;
    const memberSignatureMap = this.memberSignatureMaps.find(m => m.signature === signature);

    if (timesCalled !== times) {
      // eslint-disable-next-line no-console
      console.log(`Actual calls made for, "${signature}:`,
        memberSignatureMap?.functionMaps.map(m => `${m.originalSignature} x ${m.timesCalled}`));
    }

    expect(timesCalled).toEqual(times, timesCalled !== times ? '' : undefined);
  }

  private setup(member: (func: T) => any, returns: any = null, singleUse = false): void {
    const memberSignatureMap = SignatureService.GetMemberSignatureMap(member, returns, singleUse);
    this.updateMemberSignatureMaps(memberSignatureMap);
    const memberName = SignatureService.GetMemberNameFromSignature(memberSignatureMap.signature);

    if (SignatureService.MemberSignatureIsProperty(memberSignatureMap.signature)) {
      (this.object as any)[memberName] = this.getReturnValueForProperty(memberSignatureMap);
    } else {
      (this.object as any)[memberName] = ((...args: any) => {
        return this.getReturnForFunction(memberSignatureMap, args)?.();
      });
    }
  }

  private getReturnValueForProperty(memberSignatureMap: SignatureMap): Function | null {
    return this.memberSignatureMaps.find(
      s => s.signature === memberSignatureMap.signature)?.functionMaps[0]?.returns || null;
  }

  private getReturnForFunction(
    memberSignatureMap: SignatureMap,
    args: any
  ): Function | undefined {
    const { functionMapForArgs, signatureFunctionMaps } = this.getFunctionMapsFromSignature(memberSignatureMap, args);

    return functionMapForArgs ? (() => {
      functionMapForArgs.timesCalled++;
      if (signatureFunctionMaps && functionMapForArgs.singleUse) {
        const indexToDelete = signatureFunctionMaps.indexOf(functionMapForArgs);
        signatureFunctionMaps.splice(indexToDelete, 1);
      }
      return functionMapForArgs.returns;
    }) : undefined;
  }

  private getFunctionMapsFromSignature(memberSignatureMap: SignatureMap, args: string[]) {
    const existingMemberSignatureMap = this.memberSignatureMaps.find(s => s.signature === memberSignatureMap.signature);
    const signatureFunctionMaps = existingMemberSignatureMap?.functionMaps;

    let functionMapForArgs = signatureFunctionMaps?.find(m => JSON.stringify(m.state) === JSON.stringify(args));
    const functionMapsUsingAny = signatureFunctionMaps?.filter(m => m.state.includes(ANY_VALUE));

    if (!functionMapForArgs && functionMapsUsingAny?.length) {
      functionMapsUsingAny.forEach(element => {
        if (!functionMapForArgs) {
          const anyTransposedState = new Array<string>();
          args.forEach((a, i) => anyTransposedState[i] = element.state[i] === ANY_VALUE ? ANY_VALUE : a);
          functionMapForArgs = signatureFunctionMaps?.find(m => JSON.stringify(m.state) === JSON.stringify(anyTransposedState));
        }
      });
    }

    return { functionMapForArgs, signatureFunctionMaps };
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
}
