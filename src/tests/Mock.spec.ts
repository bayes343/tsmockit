import { Mock } from '../Mock';
import { Times } from '../Times';

class TestClass {
  private test = '';
  public get Test(): string {
    return this.test;
  }
  private test1: string;
  public get Test1(): string {
    return this.test1;
  }

  constructor(test1?: string) {
    this.test1 = test1 ? test1 : '';
  }
}

interface ITestInterface {
  GetStringFromInt(int: number): string;
  GetTestClassProperty(testClass: TestClass): string;
  GetNumberFromSomeStuff(json: { one: 1, two: 2 }, testClass: TestClass, num: number): number;
  GetAString(): string;
}

describe('Mock<T>', () => {
  let mockITestInterface: Mock<ITestInterface>;

  beforeEach(() => {
    mockITestInterface = new Mock<ITestInterface>();
    mockITestInterface.Setup(i => i.GetStringFromInt(1), () => 'Test');
  });

  it('should setup operations to resolve based on the state of the params entered', () => {
    mockITestInterface.Setup(i => i.GetNumberFromSomeStuff({ one: 1, two: 2 }, new TestClass(), 1), () => 1);
    mockITestInterface.Setup(i => i.GetNumberFromSomeStuff({ one: 1, two: 2 }, new TestClass('test'), 1), () => 2);

    const testPropertyValue = mockITestInterface.Object.GetNumberFromSomeStuff({ one: 1, two: 2 }, new TestClass(), 1);
    const testPropertyValue1 = mockITestInterface.Object.GetNumberFromSomeStuff({ one: 1, two: 2 }, new TestClass('test'), 1);

    expect(testPropertyValue).toEqual(1);
    expect(testPropertyValue1).toEqual(2);
  });

  it('should return \"Test\" when GetString is called', () => {
    const actual = mockITestInterface.Object.GetStringFromInt(1);
    expect(actual).toEqual('Test');
  });

  it('should return \"Test2\" when GetString called after setup is changed', () => {
    mockITestInterface.Setup(i => i.GetStringFromInt(1), () => 'Test2');
    const actual = mockITestInterface.Object.GetStringFromInt(1);
    expect(actual).toEqual('Test2');
  });

  it('should verify a setup method was called once', () => {
    mockITestInterface.Object.GetStringFromInt(1);
    mockITestInterface.Verify(i => i.GetStringFromInt(1), Times.Once);
  });

  it('should verify a setup method was never called', () => {
    mockITestInterface.Verify(i => i.GetStringFromInt(1), Times.Never);
  });

  it('should verify a method was called a given number of times', () => {
    mockITestInterface.Object.GetStringFromInt(1);
    mockITestInterface.Object.GetStringFromInt(1);
    mockITestInterface.Object.GetStringFromInt(1);
    mockITestInterface.Verify(i => i.GetStringFromInt(1), 3);
  });

  it('should handle multiple setups for the same operation', () => {
    mockITestInterface.Setup(i => i.GetStringFromInt(3), () => '3');
    mockITestInterface.Setup(i => i.GetStringFromInt(1), () => '1');
    mockITestInterface.Setup(i => i.GetStringFromInt(2), () => '2');

    expect(mockITestInterface.Object.GetStringFromInt(3)).toEqual('3');
    expect(mockITestInterface.Object.GetStringFromInt(1)).toEqual('1');
    expect(mockITestInterface.Object.GetStringFromInt(2)).toEqual('2');
  });

  it('should setup a method that has no params', () => {
    mockITestInterface.Setup(i => i.GetAString(), () => 'string');
    const actual = mockITestInterface.Object.GetAString();
    expect(actual).toEqual('string');
  });

});
