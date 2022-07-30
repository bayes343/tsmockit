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
  StringProperty: string;
  StringsProperty: Array<string>;
  GetStringFromInt(int: number): string;
  GetNumberFromSomeStuff(json: { one: 1, two: 2 }, testClass: TestClass, num: number): number;
  GetAString(): string;
}

class DiTest {
  private dependency: ITestInterface;

  constructor(dependency: ITestInterface) {
    this.dependency = dependency;
  }

  GetStringFromInt(int: number): string {
    return this.dependency.GetStringFromInt(int);
  }

  GetNumberFromSomeStuff(json: { one: 1, two: 2 }, testClass: TestClass, num: number): number {
    return this.dependency.GetNumberFromSomeStuff(json, testClass, num);
  }

  GetAString(): string {
    return this.dependency.GetAString();
  }
}

describe('Mock<T>', () => {
  let mockITestInterface: Mock<ITestInterface>;

  beforeEach(() => {
    mockITestInterface = new Mock<ITestInterface>();
    mockITestInterface.Setup(i => i.GetStringFromInt(1), 'Test');
  });

  it('should setup operations to resolve based on the state of the params entered', () => {
    mockITestInterface.Setup(i => i.GetNumberFromSomeStuff({ one: 1, two: 2 }, new TestClass(), 1), 1);
    mockITestInterface.Setup(i => i.GetNumberFromSomeStuff({ one: 1, two: 2 }, new TestClass('test'), 1), 2);

    const testPropertyValue = mockITestInterface.Object.GetNumberFromSomeStuff({ one: 1, two: 2 }, new TestClass(), 1);
    const testPropertyValue1 = mockITestInterface.Object.GetNumberFromSomeStuff(
      { one: 1, two: 2 }, new TestClass('test'), 1);

    expect(testPropertyValue).toEqual(1);
    expect(testPropertyValue1).toEqual(2);
  });

  it('should return \"Test\" when GetString is called', () => {
    const actual = mockITestInterface.Object.GetStringFromInt(1);
    expect(actual).toEqual('Test');
  });

  it('should return \"Test2\" when GetString called after setup is changed', () => {
    mockITestInterface.Setup(i => i.GetStringFromInt(1), 'Test2');
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
    mockITestInterface.Setup(i => i.GetStringFromInt(3), '3');
    mockITestInterface.Setup(i => i.GetStringFromInt(1), '1');
    mockITestInterface.Setup(i => i.GetStringFromInt(2), '2');

    expect(mockITestInterface.Object.GetStringFromInt(3)).toEqual('3');
    expect(mockITestInterface.Object.GetStringFromInt(1)).toEqual('1');
    expect(mockITestInterface.Object.GetStringFromInt(2)).toEqual('2');
  });

  it('should setup a method that has no params', () => {
    mockITestInterface.Setup(i => i.GetAString(), 'string');
    const actual = mockITestInterface.Object.GetAString();
    expect(actual).toEqual('string');
  });

  it('should setup and verify a dependency in a common di scenario', () => {
    mockITestInterface.Setup(i => i.GetAString(), 'string');
    mockITestInterface.Setup(i => i.GetStringFromInt(3), '3');
    mockITestInterface.Setup(i => i.GetNumberFromSomeStuff({ one: 1, two: 2 }, new TestClass('test'), 1), 2);
    const classInstance = new DiTest(mockITestInterface.Object);

    expect(classInstance.GetAString()).toEqual('string');
    expect(classInstance.GetStringFromInt(3)).toEqual('3');
    expect(classInstance.GetNumberFromSomeStuff({ one: 1, two: 2 }, new TestClass('test'), 1)).toEqual(2);

    mockITestInterface.Verify(i => i.GetAString(), 1);
    mockITestInterface.Verify(i => i.GetStringFromInt(3), 1);
    mockITestInterface.Verify(i => i.GetNumberFromSomeStuff({ one: 1, two: 2 }, new TestClass('test'), 1), 1);
  });

  it('should mock properties', () => {
    mockITestInterface.Setup(i => i.StringProperty, 'string');
    expect(mockITestInterface.Object.StringProperty).toEqual('string');

    const strings = ['one', 'two'];
    mockITestInterface.Setup(i => i.StringsProperty, strings);
    expect(mockITestInterface.Object.StringsProperty).toEqual(strings);
  });

  it('should mock operations', () => {
    mockITestInterface.Setup(i => i.GetAString(), 'string');
    expect(mockITestInterface.Object.GetAString()).toEqual('string');
  });

  it('should return the call count for a member that was called', () => {
    mockITestInterface.Setup(i => i.GetAString(), 'string');
    const classInstance = new DiTest(mockITestInterface.Object);
    for (let i = 0; i < 3; i++) {
      classInstance.GetAString();
    }

    const callCount = mockITestInterface.TimesMemberCalled(i => i.GetAString());

    expect(callCount).toEqual(3);
  });

  it('should return 0 for a member that was not called', () => {
    mockITestInterface.Setup(i => i.GetAString(), 'string');
    mockITestInterface.Setup(i => i.GetStringFromInt(3), '3');
    const classInstance = new DiTest(mockITestInterface.Object);
    classInstance.GetStringFromInt(4);

    const callCount = mockITestInterface.TimesMemberCalled(i => i.GetAString());

    expect(callCount).toEqual(0);
  });

  it('should default to the first setup when exact match is not found', () => {
    mockITestInterface.Setup(i => i.GetStringFromInt(1), 'one');
    mockITestInterface.Setup(i => i.GetStringFromInt(3), 'three');
    const classInstance = new DiTest(mockITestInterface.Object);

    classInstance.GetStringFromInt(2);

    mockITestInterface.Verify(i => i.GetStringFromInt(2), Times.Once);
  });

  it('should NOT default to the first setup when true was passed to setup exactSignatureMatch param', () => {
    mockITestInterface.Setup(i => i.GetStringFromInt(1), 'one', true);
    const classInstance = new DiTest(mockITestInterface.Object);

    classInstance.GetStringFromInt(2);

    mockITestInterface.Verify(i => i.GetStringFromInt(2), Times.Never);
  });
});
