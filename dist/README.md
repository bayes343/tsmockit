# tsmockit
Generic mocking library for TypeScript

[![CI](https://github.com/bayes343/tsmockit/actions/workflows/ci.yml/badge.svg)](https://github.com/bayes343/tsmockit/actions/workflows/ci.yml)
![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/bayes343/tsmockit.svg?logo=lgtm&logoWidth=18)


Helpful links:
- [GitHub](https://github.com/bayes343/tsmockit)
- [npm](https://www.npmjs.com/package/tsmockit)

This library exposes a generic class, `Mock<T>`, which allows you to mock dependencies and verify usage in an intuitive and type safe manner.

Public interface:

```typescript
class Mock<T>
```
```typescript
Setup(
  member: (func: T) => any,
  returns: any = null
): void
```
```typescript
TimesMemberCalled(
  member: (func: T) => any
): number
```
```typescript
Verify(
  member: (func: T) => any,
  times: Times | number
): void
```

```typescript
class TestHelpers
```
```typescript
static EmitEventAtElement(element: HTMLElement, eventType: string): void
```
```typescript
static EmitKeyEventAtElement(
  element: HTMLInputElement,
  key: string,
  keyEvent: 'keydown' | 'keypress' | 'keyup' | 'input'
): void
```
```typescript
static async TimeLapsedCondition(condition: () => boolean, interval = 10): Promise<boolean>
```

## Usage

### Scenario
Consider this dependency injection scenario.

```ts
interface IEngine {
  Start(): void;
  Stop(): void;
}

interface IOdometer {
  GetMileage(): number;
}

interface IStereo {
  SetStation(frequency: number): string;
}

class Car {
  private poweredOn = false;
  public get PoweredOn(): boolean {
    return this.poweredOn;
  }

  public get Mileage(): number {
    return this.odometer.GetMileage();
  }

  private engine: IEngine;
  private odometer: IOdometer;
  private stereo: IStereo;

  constructor(
    engine: IEngine,
    odometer: IOdometer,
    stereo: IStereo
  ) {
    this.engine = engine;
    this.odometer = odometer;
    this.stereo = stereo;
  }

  public StartEngine(): void {
    this.engine.Start();
    this.poweredOn = true;
  }

  public StopEngine(): void {
    this.engine.Stop();
    this.poweredOn = false;
  }

  public ChangeRadioStation(frequency: number): string {
    return this.stereo.SetStation(frequency);
  }
}
```

The `Car` class above uses dependency injection for its engine, odometer, and stereo dependencies.

It's a best practice to use dependency injection over 'newing' up concretions inside a class instance.  This allows true unit testing as well as widely opening the door to future extendability.

### Example
Here's how you would use `tsmockit` to mock the above dependencies and test the `Car` class.

```ts
// Instantiate mocks
const mockIEngine = new Mock<IEngine>();
const mockIOdometer = new Mock<IOdometer>();
const mockIStereo = new Mock<IStereo>();

// Instantiate car, passing mock 'Objects' as its dependencies
const car = new Car(mockIEngine.Object, mockIOdometer.Object, mockIStereo.Object);

// 'Setup' the mock odometer to return 100
mockIOdometer.Setup(o => o.GetMileage(), 100);

// Assert that the Car's mileage property returns 100 and that our mock GetMileage method is called exactly once
expect(car.Mileage).toEqual(100);
mockIOdometer.Verify(o => o.GetMileage(), 1);

// Setup mock stereo to return different strings for different arguments
mockIStereo.Setup(s => s.SetStation(1), 'Station set to 1');
mockIStereo.Setup(s => s.SetStation(2), 'Station set to 2');
```

## Conventions
You'll often want a mock to return the same response regardless of input parameters.  This library accommodates this through these conventions:
- If only one 'Setup' is made for a given method, the return value will be used for any combination of parameters (i.e. parameter values other than those specified in the setup).
- If a method is called and no exact setup is available, the first 'Setup' will be returned.  In other words, if you have multiple setups for a method and this method is called using parameters that none of those setups accounted for, the return value will be the one specified in the first setup.
