import { Expect } from '../Expect';

describe('Expect', () => {
  it('should execute an async to be truthy assertion', async () => {
    let variable = false;
    setTimeout(() => {
      variable = true;
    }, 5);

    await Expect(
      () => variable,
      (m => m.toBeTruthy())
    );
  });

  it('should execute an async to equal assertion', async () => {
    let variable = 'one';
    setTimeout(() => {
      variable = 'two';
    }, 5);

    await Expect(
      () => variable !== 'one' ? variable : null,
      (m => m.toEqual('two'))
    );
  });
});
