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

  it('should execute an async to be truthy assertion', async () => {
    let variable = false;
    setTimeout(() => {
      variable = true;
    }, 5);

    await TestHelpers.Expect(
      () => variable,
      (m => m.toBeTruthy())
    );
  });

  it('should execute an async to equal assertion', async () => {
    let variable = 'one';
    setTimeout(() => {
      variable = 'two';
    }, 5);

    await TestHelpers.Expect(
      () => variable !== 'one' ? variable : null,
      (m => m.toEqual('two'))
    );
  });
});
