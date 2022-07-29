export class TestHelpers {
  // eslint-disable-next-line no-empty-function
  private constructor() { }

  /**
   * Emit an event at a given element
   * @param element
   * @param eventType
   */
  public static EmitEventAtElement(element: HTMLElement, eventType: string): void {
    const event = document.createEvent('Event');
    event.initEvent(eventType);
    element.dispatchEvent(event);
  }

  /**
   * Emit a key event at a given element
   * @param element
   * @param key
   * @param keyEvent
   */
  public static EmitKeyEventAtElement(
    element: HTMLInputElement,
    key: string,
    keyEvent: 'keydown' | 'keypress' | 'keyup' | 'input'
  ): void {
    const event = document.createEvent('Event') as any;

    event['keyCode'] = key;
    event['key'] = key;

    event.initEvent(keyEvent);
    element.dispatchEvent(event);
  }

  /**
   * Wait up to 1 second for a given condition to be true
   * @deprecated Will be removed in version 2 - Use "Expect" instead
   * @param condition
   * @param interval
   * @returns true if condition is met before 1 second limit, false otherwise
   */
  public static async TimeLapsedCondition(condition: () => boolean, interval = 10): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      let assertionPassed = false;
      let elapsedTime = 0;
      const enabled = (() => {
        return !assertionPassed && elapsedTime < 1000;
      });

      const executer = setInterval(async () => {
        elapsedTime += interval;
        if (enabled()) {
          assertionPassed = condition();
        } else {
          clearInterval(executer);
          resolve(assertionPassed);
        }
      }, interval);
    });
  }

  /**
   * Performs an asynchronous assertion, allowing up to one second to pass before failing
   * @param selector A function that returns the subject of the assertion once it is expected to pass.
   * @param assertion A function that is given the result of the selector function for normal jasmine assertions.
   */
  public static async Expect<T>(
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
}
