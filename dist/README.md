# tsmockit
Generic mocking library for TypeScript

[![CI](https://github.com/bayes343/tsmockit/actions/workflows/ci.yml/badge.svg)](https://github.com/bayes343/tsmockit/actions/workflows/ci.yml)
![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/bayes343/tsmockit.svg?logo=lgtm&logoWidth=18)

Helpful links:
- [GitHub](https://github.com/bayes343/tsmockit)
- [Docs](https://bayes343.github.io/tsmockit/modules.html)

This library exposes a generic class, `Mock<T>`, which allows you to mock dependencies and verify usage in an intuitive and type safe manner.  Its API is based on the C# "moq" library.

The below example demonstrates some of the features of this library. Please explore the "docs" linked above for further details.

```typescript
// https://github.com/bayes343/tsmockit/blob/master/src/Mock/tests/Mock-Car-Example.spec.ts

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

describe('Car', () => {
  let car: Car;
  const mockIEngine = new Mock<IEngine>();
  const mockIOdometer = new Mock<IOdometer>();
  const mockIStereo = new Mock<IStereo>();

  beforeEach(() => {
    car = new Car(mockIEngine.Object, mockIOdometer.Object, mockIStereo.Object);
  });

  it('should call Engine.Start when StartEngine is called', () => {
    mockIEngine.Setup(e => e.Start());
    car.StartEngine();
    mockIEngine.Verify(e => e.Start(), Times.Once);
  });

  it('should call Engine.Stop when StopEngine is called', () => {
    mockIEngine.Setup(e => e.Stop());
    car.StopEngine();
    mockIEngine.Verify(e => e.Stop(), Times.Once);
  });

  it('should return the result of Odometer.GetMileage on referencing the Mileage property', () => {
    mockIOdometer.Setup(o => o.GetMileage(), 100);

    const mileage = car.Mileage;

    expect(mileage).toEqual(100);
    mockIOdometer.Verify(o => o.GetMileage(), Times.Once);
  });

  it('should call Stereo.SetStation on calling ChangeRadioStation returning the string from Stereo', () => {
    mockIStereo.Setup(s => s.SetStation(Any<number>()), 'Station set'); // default fallback setup when a more specific setup isn't available
    mockIStereo.Setup(s => s.SetStation(3), 'Station 3');

    expect(car.ChangeRadioStation(3)).toEqual('Station 3');
    expect(car.ChangeRadioStation(0)).toEqual('Station set');
    expect(car.ChangeRadioStation(2)).toEqual('Station set');

    mockIStereo.Verify(s => s.SetStation(3), Times.Once);
    mockIStereo.Verify(s => s.SetStation(Any<number>()), 2);
  });
});
```
