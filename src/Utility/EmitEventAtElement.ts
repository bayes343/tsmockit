/**
 * Emit an event at a given element
 * @param element
 * @param eventType
 */
export function EmitEventAtElement(element: HTMLElement, eventType: string): void {
  const event = document.createEvent('Event');
  event.initEvent(eventType);
  element.dispatchEvent(event);
}
