import { OrderBy } from '../OrderBy';

describe('OrderBy', () => {
  it('should order by even elements then value', () => {
    const ordered = OrderBy([5, 4, 3, 2, 1], [
      i => i % 2 === 0 ? 0 : 1,
      i => i
    ]);
    expect(ordered[0]).toEqual(2);
  });

  it('should order by strings', () => {
    const ordered = OrderBy(['zebra', 'apple', 'c', 'b', 'f', 'e'], [
      i => i
    ]);

    expect(ordered[0]).toEqual('apple');
    expect(ordered[5]).toEqual('zebra');
  });

  it('should order by strings on objects', () => {
    const ordered = OrderBy([
      { value: 'zebra' },
      { value: 'apple' },
      { value: 'c' },
      { value: 'b' },
      { value: 'f' },
      { value: 'e' }
    ], [
      i => i.value
    ]);

    expect(ordered[0]).toEqual({ value: 'apple' });
    expect(ordered[5]).toEqual({ value: 'zebra' });
  });
});
