import { SmetRewardService } from '../service';

describe('SmetRewardService', () => {
  it('returns correct open tx data shape', () => {
    const s = new SmetRewardService();
    const tx = s.getOpenTxData(true, '0.01');
    expect(tx).toHaveProperty('to');
    expect(tx).toHaveProperty('data');
    expect(tx.data).toHaveProperty('method', 'open');
  });
});
