import * as web3 from '../index';

test('web3 index exports useTier', () => {
  expect(typeof web3.useTier).toBe('function');
});
