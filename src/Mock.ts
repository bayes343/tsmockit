import { Times } from './Times';

export class Mock<T> {
  private callTimesMap: any = {};

  private object: T = {} as T;
  public get Object(): T {
    return this.object;
  }

  public Setup(operation: (func: T) => any, returns: (() => any)): void {
    const operationString = this.getPropertyName(operation);

    (this.object as any)[operationString] = (() => {
      this.callTimesMap[operationString]++;
      return returns();
    });

    this.callTimesMap[operationString] = 0;
  }

  public Verify(operation: (func: T) => any, times: Times | number): void {
    const operationString = this.getPropertyName(operation);
    expect(this.callTimesMap[operationString]).toEqual(times);
  }

  private getPropertyName(value: (obj: T) => any): string {
    let name = '';

    const propertyNameMatches = value.toString().match(/return\s[\w\d_]*\.([\w\d$_]*)\;/);
    console.log(propertyNameMatches);
    if (propertyNameMatches && propertyNameMatches[1]) {
      name = propertyNameMatches[1];
    }

    return name;
  }

}
