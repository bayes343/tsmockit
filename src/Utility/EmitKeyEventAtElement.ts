/**
 * Emit a key event at a given element
 * @param element
 * @param key
 * @param keyEvent
 */
export function EmitKeyEventAtElement(
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
