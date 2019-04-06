import { Mock } from '../Mock';
import { Times } from '../Times';

interface ITestInterface {
  GetString(): string;
}

describe('Mock<T>', () => {
  let mockITestInterface: Mock<ITestInterface>;

  beforeEach(() => {
    // mockITestInterface = new Mock<ITestInterface>();
    // mockITestInterface.Setup(i => i.GetString, () => 'Test');
  });

  it('should blah', () => {

  });
  // it('should return \"Test\" when GetString is called', () => {
  //   const actual = mockITestInterface.Object.GetString();
  //   expect(actual).toEqual('Test');
  // });

  // it('should return \"Test2\" when GetString called after setup is changed', () => {
  //   mockITestInterface.Setup(i => i.GetString, () => 'Test2');
  //   const actual = mockITestInterface.Object.GetString();
  //   expect(actual).toEqual('Test2');
  // });

  // it('should verify a setup method was called once', () => {
  //   mockITestInterface.Object.GetString();
  //   mockITestInterface.Verify('GetString', Times.Once);
  // });

  // it('should verify a setup method was never called', () => {
  //   mockITestInterface.Verify('GetString', Times.Never);
  // });

  // it('should verify a method was called a given number of times', () => {
  //   mockITestInterface.Object.GetString();
  //   mockITestInterface.Object.GetString();
  //   mockITestInterface.Object.GetString();
  //   mockITestInterface.Verify('GetString', 3);
  // });
});
