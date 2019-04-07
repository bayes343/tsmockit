import { Times } from './Times';
import { Regex } from './Constants';

type FunctionMap = {
  state: string,
  returns: Function,
  timesCalled: number
};

type SignatureMap = {
  signature: string,
  functionMaps: Array<FunctionMap>
};

export class Mock<T> {
  private memberSignatureMaps = new Array<SignatureMap>();

  private object: T = {} as T;
  public get Object(): T {
    return this.object;
  }

  public Setup(member: (func: T) => any, returns: (() => any)): void {
    const memberSignatureMap = this.getMemberSignatureMap(member, returns);
    this.updateMemberSignatureMaps(memberSignatureMap);

    (this.object as any)[this.getMemberName(memberSignatureMap.signature)] = ((...args: any) => {

      let returnFunction: Function | null = null;
      const memberSignature = this.memberSignatureMaps.find(s => s.signature === memberSignatureMap.signature);
      if (memberSignature && memberSignatureMap.functionMaps[0]) {
        const functionMap = memberSignature.functionMaps.find(m => JSON.stringify(m.state) === JSON.stringify(args));
        returnFunction = functionMap ? (() => {
          functionMap.timesCalled++;
          return functionMap.returns();
        }) : null;
      }
      return returnFunction ? returnFunction() : (() => console.error('Unable to resolve setup function'));
    });
  }

  public Verify(member: (func: T) => any, times: Times | number): void {
    const memberSignature = this.getMemberSignatureMap(member);
    const functionMap: FunctionMap | undefined = this.getFunctionMapForMemberSignatureMap(memberSignature);
    const timesCalled = functionMap ? functionMap.timesCalled : 0;
    expect(timesCalled).toEqual(times);
  }

  private getMemberSignatureMap(value: (obj: T) => any, returns?: (() => any)): SignatureMap {
    let memberSignature = '';

    memberSignature =
      this.getPropertyMemberSignature(value, memberSignature) ||
      this.getOperationMemberSignature(value, memberSignature);

    const state = this.getStateForMemberSignature(memberSignature, value);

    return {
      signature: memberSignature,
      functionMaps: [{ state: state, returns: returns ? returns : () => null, timesCalled: 0 }]
    };
  }

  private getPropertyMemberSignature(value: (obj: T) => any, memberSignature: string) {
    const propertyMemberMatches = this.getMatchesForRegex(value, Regex.Property);
    if (propertyMemberMatches && propertyMemberMatches[1]) {
      memberSignature = propertyMemberMatches[1];
    }
    return memberSignature;
  }

  private getOperationMemberSignature(value: (obj: T) => any, memberSignature: string) {
    const operationNameMatches = this.getMatchesForRegex(value, Regex.Operation);

    if (operationNameMatches && operationNameMatches[1]) {
      memberSignature = operationNameMatches[1];
      if (operationNameMatches[2]) {
        const paramString = this.getParamString(operationNameMatches);
        memberSignature += `(${paramString})`;
      }
    }

    return memberSignature;
  }

  private getStateForMemberSignature(memberSignature: string, value: (obj: T) => any) {
    let state = '';
    const obj = {} as any;
    obj[this.getMemberName(memberSignature)] = ((...args: any) => {
      state = args;
    });
    value(obj);
    return state;
  }

  private getMatchesForRegex(expressionToEvaluate: (exp: T) => any, regex: RegExp): RegExpMatchArray | null {
    let matches = null;
    matches = expressionToEvaluate.toString().match(regex);
    return matches;
  }

  private getParamString(operationNameMatches: RegExpMatchArray) {
    const paramStrings = operationNameMatches[2].match(Regex.Params);
    let params = '';
    for (let index = 0; index < (paramStrings ? paramStrings.length : 0); index++) {
      params += (`${index > 0 ? ', ' : ''}p${index}`);
    }
    return params;
  }

  private updateMemberSignatureMaps(memberSignatureMap: SignatureMap) {
    const existingSignatureMap = this.memberSignatureMaps.find(m => m.signature === memberSignatureMap.signature);
    if (existingSignatureMap && memberSignatureMap.functionMaps[0]) {
      const existingFunctionMap = existingSignatureMap.functionMaps.find(
        fm => JSON.stringify(fm.state) === JSON.stringify(memberSignatureMap.functionMaps[0].state));
      if (existingFunctionMap) {
        const functionMaps = existingSignatureMap.functionMaps;
        functionMaps.splice(functionMaps.indexOf(existingFunctionMap), 1, memberSignatureMap.functionMaps[0]);
      } else {
        existingSignatureMap.functionMaps.push(memberSignatureMap.functionMaps[0]);
      }
    } else {
      this.memberSignatureMaps.push(memberSignatureMap);
    }
  }

  private getMemberName(memberSignatureString: string) {
    return memberSignatureString.indexOf('(') >= 0 ? memberSignatureString.split('(')[0] : memberSignatureString;
  }

  private getFunctionMapForMemberSignatureMap(memberSignature: SignatureMap) {
    let functionMap: FunctionMap | undefined;
    const functionMapToFind = memberSignature.functionMaps[0];
    const existingMember = this.memberSignatureMaps.find(m => m.signature === memberSignature.signature);
    if (existingMember && functionMapToFind) {
      const functionMapCount = existingMember.functionMaps ? existingMember.functionMaps.length : 0;
      if (functionMapCount === 1) {
        functionMap = existingMember.functionMaps[0];
      } else {
        functionMap = existingMember.functionMaps.find(m => JSON.stringify(m.state) === JSON.stringify(functionMapToFind.state));
      }
    }
    return functionMap;
  }

}
