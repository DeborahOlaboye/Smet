import { getRewardContractConfig } from '../contracts';

describe('contracts', () => {
  it('returns address and abi', () => {
    const cfg = getRewardContractConfig();
    expect(cfg).toHaveProperty('address');
    expect(cfg).toHaveProperty('abi');
  });
});
