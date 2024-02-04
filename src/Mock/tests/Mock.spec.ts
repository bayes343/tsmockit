/* eslint-disable max-lines */
import { Any } from '../Any';
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
  GetSumFromNumbers(num1: number, num2: number): number;
  GetSumFromOneOrTwoNumbers(num1: number, num2?: number): number;
  GetWithLambda(lambda: (any: any) => any): number;
  GetObjectFromObject(obj: object): object;
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

  GetSumFromNumbers(num1: number, num2: number): number {
    return this.dependency.GetSumFromNumbers(num1, num2);
  }

  GetSumFromOneOrTwoNumbers(num1: number, num2?: number): number {
    return this.dependency.GetSumFromOneOrTwoNumbers(num1, num2);
  }

  GetWithLambda(lambda: (any: any) => any): number {
    return this.dependency.GetWithLambda(lambda);
  }

  GetObjectFromInt(obj: object): object {
    return this.dependency.GetObjectFromObject(obj);
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

  it('should NOT default to the first setup when exact match is not found', () => {
    mockITestInterface.Setup(i => i.GetStringFromInt(1), 'one');
    mockITestInterface.Setup(i => i.GetStringFromInt(3), 'three');
    const classInstance = new DiTest(mockITestInterface.Object);

    classInstance.GetStringFromInt(2);

    mockITestInterface.Verify(i => i.GetStringFromInt(2), Times.Never);
  });

  it('should use Any to setup a default setup when no exact match is found', () => {
    mockITestInterface.Setup(i => i.GetStringFromInt(Any<number>()), 'three');
    mockITestInterface.Setup(i => i.GetStringFromInt(1), 'one');
    const classInstance = new DiTest(mockITestInterface.Object);

    const actual = classInstance.GetStringFromInt(2);

    expect(actual).toEqual('three');
    mockITestInterface.Verify(i => i.GetStringFromInt(Any<number>()), Times.Once);
  });

  it('should define a setup only to be used only once', () => {
    mockITestInterface.SetupOnce(i => i.GetAString(), 'one');
    const classInstance = new DiTest(mockITestInterface.Object);

    const first = classInstance.GetAString();
    const second = classInstance.GetAString?.();

    expect(first).toEqual('one');
    expect(second).toBeUndefined();
  });

  it('should use a single use setup before other setups', () => {
    mockITestInterface.SetupOnce(i => i.GetStringFromInt(1), 'one');
    const classInstance = new DiTest(mockITestInterface.Object);

    expect(classInstance.GetStringFromInt(1)).toEqual('one');
    expect(classInstance.GetStringFromInt(1)).toEqual('Test');
  });

  it('should return undefined for an invocation not covered by a setup', () => {
    mockITestInterface.SetupOnce(i => i.GetStringFromInt(2), 'two');
    const classInstance = new DiTest(mockITestInterface.Object);

    expect(classInstance.GetStringFromInt(2)).toEqual('two');
    expect(classInstance.GetStringFromInt(3)).toBeUndefined();
  });

  it('should define a setup sequence, with each setup only working once', () => {
    mockITestInterface.SetupSequence([
      [i => i.GetAString(), 'one'],
      [i => i.GetAString(), 'two']
    ]);
    const classInstance = new DiTest(mockITestInterface.Object);

    const first = classInstance.GetAString();
    const second = classInstance.GetAString();

    expect(first).toEqual('one');
    expect(second).toEqual('two');
  });

  it('should verify a setup that returns an empty string', () => {
    mockITestInterface.Setup(i => i.GetAString(), '');
    const classInstance = new DiTest(mockITestInterface.Object);

    const result = classInstance.GetAString();

    expect(result).toEqual('');
    mockITestInterface.Verify(i => i.GetAString(), Times.Once);
  });

  it('should distinguish between multiple setups that return the same value', () => {
    mockITestInterface.Setup(i => i.GetStringFromInt(1), 'one');
    mockITestInterface.Setup(i => i.GetStringFromInt(2), 'one');
    const classInstance = new DiTest(mockITestInterface.Object);

    classInstance.GetStringFromInt(1);
    classInstance.GetStringFromInt(2);

    mockITestInterface.Verify(i => i.GetStringFromInt(1), Times.Once);
    mockITestInterface.Verify(i => i.GetStringFromInt(2), Times.Once);
  });

  it('should use Any to make a setup that will accept any value passed for the given parameter', () => {
    mockITestInterface.Setup(i => i.GetStringFromInt(Any<number>()), 'one');
    const classInstance = new DiTest(mockITestInterface.Object);

    const actual = classInstance.GetStringFromInt(100);

    expect(actual).toEqual('one');
    mockITestInterface.Verify(i => i.GetStringFromInt(Any<number>()), Times.Once);
  });

  it('should use Any to make a setup that will accept any value passed for the given parameter regardless of position', () => {
    mockITestInterface.Setup(i => i.GetSumFromNumbers(2, Any<number>()), 2);
    const classInstance = new DiTest(mockITestInterface.Object);

    const actual = classInstance.GetSumFromNumbers(2, 1);

    expect(actual).toEqual(2);
    mockITestInterface.Verify(i => i.GetSumFromNumbers(2, Any<number>()), Times.Once);
  });

  it('should use Any to make a setup that will accept any value passed for a complex object param', () => {
    mockITestInterface.Setup(i => i.GetNumberFromSomeStuff(Any<{ one: 1, two: 2 }>(), Any<TestClass>(), 1), 2);
    const classInstance = new DiTest(mockITestInterface.Object);

    const actual = classInstance.GetNumberFromSomeStuff({} as any, {} as any, 1);

    expect(actual).toEqual(2);
    mockITestInterface.Verify(i => i.GetNumberFromSomeStuff(Any<{ one: 1, two: 2 }>(), Any<TestClass>(), 1), Times.Once);
  });

  it('should allow use for any for some params and literal values for others', () => {
    mockITestInterface.Setup(i => i.GetSumFromNumbers(Any<number>(), 1), 100);
    const classInstance = new DiTest(mockITestInterface.Object);

    expect(classInstance.GetSumFromNumbers(10, 1)).toEqual(100);
    expect(classInstance.GetSumFromNumbers(5, 1)).toEqual(100);
    expect(classInstance.GetSumFromNumbers(1, 1)).toEqual(100);
  });

  it('should not allow ANY_VALUE match to interfere with more specific match', () => {
    mockITestInterface.Setup(i => i.GetSumFromOneOrTwoNumbers(Any<number>(), undefined), 100);
    mockITestInterface.Setup(i => i.GetSumFromOneOrTwoNumbers(1, 2), 200);
    const classInstance = new DiTest(mockITestInterface.Object);

    expect(classInstance.GetSumFromOneOrTwoNumbers(1)).toEqual(100);
    expect(classInstance.GetSumFromOneOrTwoNumbers(1, 2)).not.toEqual(100);
    mockITestInterface.Verify(i => i.GetSumFromOneOrTwoNumbers(Any<number>(), undefined), 1);
    mockITestInterface.Verify(i => i.GetSumFromOneOrTwoNumbers(1, 2), 1);
  });

  it('should mock a member that takes a lambda as a parameter', () => {
    mockITestInterface.Setup(i => i.GetWithLambda(a => a.b.a), 0);
    mockITestInterface.Setup(i => i.GetWithLambda(a => a.b.b), 0);
    mockITestInterface.Setup(i => i.GetWithLambda(a => a.c.d), 2);
    mockITestInterface.Setup(i => i.GetWithLambda(a => a.b.c), 1);
    const classInstance = new DiTest(mockITestInterface.Object);

    classInstance.GetWithLambda(a => a.b.a);
    classInstance.GetWithLambda(a => a.b.a);

    expect(classInstance.GetWithLambda(a => a.b.c)).toEqual(1);
    expect(classInstance.GetWithLambda(a => a.c.d)).toEqual(2);
    mockITestInterface.Verify(i => i.GetWithLambda(a => a.b.a), 2);
    mockITestInterface.Verify(i => i.GetWithLambda(a => a.b.c), 1);
    mockITestInterface.Verify(i => i.GetWithLambda(a => a.c.d), 1);
    mockITestInterface.Verify(i => i.GetWithLambda(a => a.b.b), Times.Never);
    expect(classInstance.GetWithLambda(a => a.b.f)).toBeUndefined();
  });

  it('should return the correct value from a setup that used a variable', () => {
    const int = 5;
    mockITestInterface.Setup(i => i.GetStringFromInt(int), 'five');
    const classInstance = new DiTest(mockITestInterface.Object);

    expect(classInstance.GetStringFromInt(5)).toEqual('five');
    expect(classInstance.GetStringFromInt(int)).toEqual('five');
  });

  enum Values {
    One = 1,
    Two = 2,
    Five = 5,
    Ten = 10,
  }

  it('should return the correct value from a setup that used an enum', () => {
    mockITestInterface.Setup(i => i.GetStringFromInt(Values.Ten), 'ten');
    const classInstance = new DiTest(mockITestInterface.Object);

    expect(classInstance.GetStringFromInt(10)).toEqual('ten');
    expect(classInstance.GetStringFromInt(Values.Ten)).toEqual('ten');
  });

  it('should use ANY setups as a last resort', () => {
    mockITestInterface.Setup(i => i.GetObjectFromObject(Any<object>()), { value: 'any' });
    mockITestInterface.Setup(i => i.GetObjectFromObject({ value: Values.Ten, test: 11 }), { value: 'ten' });
    mockITestInterface.Setup(i => i.GetObjectFromObject(Any<object>()), { value: 'any' });
    const classInstance = new DiTest(mockITestInterface.Object);

    expect(classInstance.GetObjectFromInt({ value: 10, test: 11 })).toEqual({ value: 'ten' });
    expect(classInstance.GetObjectFromInt({ value: Values.Ten, test: 11 })).toEqual({ value: 'ten' });
  });
});
