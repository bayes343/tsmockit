export const ANY_VALUE = 'ANYTHING';

export function Any<T>(): T {
  return ANY_VALUE as unknown as T;
}
