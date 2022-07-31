import { Regex } from './Constants';
import { SignatureMap } from './SignatureMap';

export class SignatureService {
  public static GetMemberSignatureMap(value: (obj: any) => any, returns?: any, exactSignatureMatch = false): SignatureMap {
    let memberSignature = '';

    memberSignature =
      this.getOperationMemberSignature(value, memberSignature) ||
      this.getPropertyMemberSignature(value, memberSignature);

    const state = this.MemberSignatureIsProperty(memberSignature) ? '' :
      SignatureService.getStateForMemberSignature(memberSignature, value);

    return {
      signature: memberSignature,
      functionMaps: [{ default: !exactSignatureMatch, state: state, returns: returns ? returns : null, timesCalled: 0 }]
    };
  }

  public static MemberSignatureIsProperty(memberSignatureString: string): boolean {
    return memberSignatureString.indexOf('(') < 0;
  }

  public static GetMemberNameFromSignature(memberSignatureString: string): string {
    return SignatureService.MemberSignatureIsProperty(memberSignatureString) ?
      memberSignatureString : memberSignatureString.split('(')[0];
  }

  private static getPropertyMemberSignature(value: (obj: any) => any, memberSignature: string) {
    const propertyMemberMatches = SignatureService.getMatchesForRegex(value, Regex.Property);

    if (propertyMemberMatches && propertyMemberMatches[1]) {
      memberSignature = propertyMemberMatches[1];
    }

    return memberSignature;
  }

  private static getOperationMemberSignature(value: (obj: any) => any, memberSignature: string) {
    const operationNameMatches = SignatureService.getMatchesForRegex(value, Regex.Operation);

    if (operationNameMatches && operationNameMatches[1]) {
      memberSignature = operationNameMatches[1];

      if (operationNameMatches[2]) {
        const paramString = SignatureService.getParamString(operationNameMatches);
        memberSignature += `(${paramString})`;
      } else {
        memberSignature += '()';
      }
    }

    return memberSignature;
  }

  private static getStateForMemberSignature(memberSignature: string, value: (obj: any) => any) {
    let state = '';
    const obj = {} as any;

    obj[this.GetMemberNameFromSignature(memberSignature)] = ((...args: any) => {
      state = args;
    });
    value(obj);

    return state;
  }

  private static getMatchesForRegex(expressionToEvaluate: (exp: any) => any, regex: RegExp): RegExpMatchArray | null {
    let matches = null;
    matches = expressionToEvaluate.toString().match(regex);
    return matches;
  }

  private static getParamString(operationNameMatches: RegExpMatchArray) {
    const paramStrings = operationNameMatches[2].match(Regex.Params);
    let params = '';

    for (let index = 0; index < (paramStrings ? paramStrings.length : 0); index++) {
      params += (`${index > 0 ? ', ' : ''}p${index}`);
    }

    return params;
  }
}
