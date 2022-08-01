import { Any } from '../Any';
import { Mock } from '../Mock';

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

describe('Mock<T> Car Example', () => {
  let car: Car;
  const mockIEngine = new Mock<IEngine>();
  const mockIOdometer = new Mock<IOdometer>();
  const mockIStereo = new Mock<IStereo>();

  beforeEach(() => {
    mockIEngine.Setup(e => e.Start());
    mockIEngine.Setup(e => e.Stop());
    mockIOdometer.Setup(o => o.GetMileage(), 100);
    mockIStereo.Setup(s => s.SetStation(Any<number>()), 'Station set');
    car = new Car(mockIEngine.Object, mockIOdometer.Object, mockIStereo.Object);
  });

  it('should mock the car class\'s dependencies allowing car to be unit tested', () => {
    car.StartEngine();
    expect(car.PoweredOn).toBeTruthy();

    car.StopEngine();
    expect(car.PoweredOn).toBeFalsy();

    expect(car.Mileage).toEqual(100);
    expect(car.ChangeRadioStation(0)).toEqual('Station set');
    expect(car.ChangeRadioStation(2)).toEqual('Station set');

    mockIStereo.Setup(s => s.SetStation(3), 'Station 3');
    expect(car.ChangeRadioStation(3)).toEqual('Station 3');

    mockIEngine.Verify(e => e.Start(), 1);
    mockIEngine.Verify(e => e.Stop(), 1);
    mockIOdometer.Verify(o => o.GetMileage(), 1);
    mockIStereo.Verify(s => s.SetStation(Any<number>()), 2);
    mockIStereo.Verify(s => s.SetStation(3), 1);
  });
});
