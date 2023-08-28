/**
 * @jest-environment jsdom
 */

import { EmitEventAtElement } from '../EmitEventAtElement';
import { Expect } from '../Expect';

describe('EmitEventAtElement', () => {
  it('should emit event at element', async () => {
    let eventFired = false;
    const testElement = document.createElement('button');
    testElement.addEventListener('click', () => eventFired = true);

    EmitEventAtElement(testElement, 'click');

    await Expect(
      () => eventFired,
      (m) => m.toBeTruthy());
  });
});
