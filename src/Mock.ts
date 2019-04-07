import { Times } from './Times';
import { Regex } from './Constants';

export class Mock<T> {
  private memberSignatureMap: any = {};
  private callTimesMap: any = {};

  private object: T = {} as T;
  public get Object(): T {
    return this.object;
  }

  public Setup(member: (func: T) => any, returns: (() => any)): void {
    const memberSignatureString = this.getMemberSignature(member);
    console.log('member signature', memberSignatureString);

    this.memberSignatureMap[memberSignatureString] = returns;

    const mayHaveArgs = memberSignatureString.indexOf('(') >= 0;

    const args = this.getArgsForMemberSignature(mayHaveArgs, memberSignatureString);
    console.log('args', args);

    (this.object as any)[this.getMemberName(mayHaveArgs, memberSignatureString)] = args.length >= 1 ?
      ((...args: any) => {
        console.log('args1', args);
        this.callTimesMap[memberSignatureString]++;
        return this.memberSignatureMap[this.getSignatureFromArgs(mayHaveArgs, memberSignatureString, args)]();
      }) :
      (() => {
        this.callTimesMap[memberSignatureString]++;
        return this.memberSignatureMap[memberSignatureString]();
      });

    this.callTimesMap[memberSignatureString] = 0;
  }

  private getSignatureFromArgs(mayHaveArgs: boolean, memberSignatureString: string, args: any) {
    const signature = `${this.getMemberName(mayHaveArgs, memberSignatureString)}(${args})`;
    console.log('signature', signature);
    return signature;
  }

  private getMemberName(mayHaveArgs: boolean, memberSignatureString: string) {
    return mayHaveArgs ? memberSignatureString.split('(')[0] : memberSignatureString;
  }

  private getArgsForMemberSignature(mayHaveArgs: boolean, memberString: string) {
    const args = new Array<string>();
    if (mayHaveArgs) {
      const argsString = memberString.split('(')[1].split(')')[0];
      if (argsString.length >= 1) {
        const argumentCount = argsString.indexOf(',') >= 0 ? argsString.split(',').length : 1;
        for (let index = 0; index < argumentCount; index++) {
          args.push(`f${index}`);
        }
      }
    }
    return args;
  }

  public Verify(member: (func: T) => any, times: Times | number): void {
    const memberString = this.getMemberSignature(member);
    expect(this.callTimesMap[memberString]).toEqual(times);
  }

  private getMemberSignature(value: (obj: T) => any): string {
    let memberSignature = '';

    memberSignature =
      this.getPropertyMemberSignature(value, memberSignature) ||
      this.getOperationMemberSignature(value, memberSignature);

    return memberSignature;
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
        memberSignature += `(${operationNameMatches[2]})`;
      }
    }
    return memberSignature;
  }

  private getMatchesForRegex(expressionToEvaluate: (exp: T) => any, regex: RegExp): RegExpMatchArray | null {
    let matches = null;
    matches = expressionToEvaluate.toString().match(regex);
    return matches;
  }

}
