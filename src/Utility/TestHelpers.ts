export class TestHelpers {
  public static EmitEventAtElement(element: HTMLElement, eventType: string): void {
    const event = document.createEvent('Event');
    event.initEvent(eventType);
    element.dispatchEvent(event);
  }

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
}
