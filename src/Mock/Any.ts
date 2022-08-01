export const ANY_VALUE = 'ANYTHING';

/**
 * Returns a value Mock understands to represent "ANYTHING" casted to "T"
 * @returns
 */
export function Any<T>(): T {
  return ANY_VALUE as unknown as T;
}
