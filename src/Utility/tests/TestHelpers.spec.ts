import { TestHelpers } from '../TestHelpers';

describe('TestHelpers', () => {

  it('should emit key event at element', async () => {
    let eventFired = false;
    const testElement = document.createElement('input');
    testElement.addEventListener('input', () => eventFired = true);

    TestHelpers.EmitKeyEventAtElement(testElement, 'a', 'input');

    expect(await TestHelpers.TimeLapsedCondition(() => eventFired)).toBeTruthy();
  });

  it('should emit event at element', async () => {
    let eventFired = false;
    const testElement = document.createElement('button');
    testElement.addEventListener('click', () => eventFired = true);

    TestHelpers.EmitEventAtElement(testElement, 'click');

    expect(await TestHelpers.TimeLapsedCondition(() => eventFired)).toBeTruthy();
  });

  it('should detect a time lapsed condition', async () => {
    let variable = false;
    setTimeout(() => {
      variable = true;
    }, 5);

    const variableIsTrue = await TestHelpers.TimeLapsedCondition(() => variable);

    expect(variableIsTrue).toBeTruthy();
  });
});
