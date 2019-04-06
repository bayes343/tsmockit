import { Times } from './Times';

export class Mock<T> {
  private callTimesMap: any = {};

  private object: T = {} as T;
  public get Object(): T {
    return this.object;
  }

  public Setup(operation: string, returns: (() => any)): void {
    (this.object as any)[operation] = (() => {
      this.callTimesMap[operation]++;
      return returns();
    });

    this.callTimesMap[operation] = 0;
  }

  public Verify(operation: string, times: Times | number): void {
    expect(this.callTimesMap[operation]).toEqual(times);
  }

}
