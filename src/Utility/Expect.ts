/**
 * Performs an asynchronous assertion, allowing up to one second to pass before failing
 * @param selector A function that returns the subject of the assertion once it is expected to pass.
 * @param assertion A function that is given the result of the selector function for normal jasmine assertions.
 */
export function Expect<T>(
  selector: () => T,
  assertion: (m: jasmine.Matchers<T>) => void,
  interval = 0,
  getTimeFunc = () => Date.now()
): Promise<void> {
  return new Promise(resolve => {
    const startTime = getTimeFunc();
    const timedOut = () => getTimeFunc() - startTime > 1000;
    const execute = () => {
      const selection = selector();
      if (selection || timedOut()) {
        assertion(expect(selection));
        resolve();
      } else {
        setTimeout(() => execute(), interval);
      }
    };
    execute();
  });
}
