import { EmitKeyEventAtElement } from '../EmitKeyEventAtElement';
import { Expect } from '../Expect';

describe('EmitKeyEventAtElement', () => {
  it('should emit key event at element', async () => {
    let eventFired = false;
    const testElement = document.createElement('input');
    testElement.addEventListener('input', () => eventFired = true);

    EmitKeyEventAtElement(testElement, 'a', 'input');

    await Expect(
      () => eventFired,
      (m) => m.toBeTruthy());
  });
});
