import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchRewards, openReward } from '../rewards';
import { readContract, writeContract, waitForTransaction } from '@wagmi/core';

// Mock wagmi functions
vi.mock('@wagmi/core', () => ({
  readContract: vi.fn(),
  writeContract: vi.fn(),
  waitForTransaction: vi.fn(),
}));

vi.mock('@/config/wagmi', () => ({
  config: {},
}));

describe('Blockchain Rewards Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchRewards', () => {
    it('should fetch rewards from smart contract', async () => {
      const mockRewards = [
        { assetType: 1, token: '0x123', idOrAmount: '1000000000000000000' },
        { assetType: 2, token: '0x456', idOrAmount: '1' },
      ];
      const mockWeights = [50, 100];
      const mockFee = '10000000000000000';

      (readContract as any).mockImplementation(({ functionName }) => {
        switch (functionName) {
          case 'getAllRewards':
            return Promise.resolve(mockRewards);
          case 'getWeights':
            return Promise.resolve(mockWeights);
          case 'fee':
            return Promise.resolve(mockFee);
          case 'getRewardStock':
            return Promise.resolve(100n);
          default:
            return Promise.resolve(null);
        }
      });

      const rewards = await fetchRewards();

      expect(rewards).toHaveLength(2);
      expect(rewards[0]).toMatchObject({
        id: '0',
        probability: 0.5,
        remaining: 100,
      });
      expect(rewards[1]).toMatchObject({
        id: '1',
        probability: 0.5,
        remaining: 100,
      });
    });

    it('should handle contract read errors gracefully', async () => {
      (readContract as any).mockRejectedValue(new Error('Contract error'));

      await expect(fetchRewards()).rejects.toThrow('Failed to fetch rewards from smart contract');
    });
  });

  describe('openReward', () => {
    it('should successfully open a reward', async () => {
      const mockHash = '0xabcdef123456789';
      const mockReceipt = { status: 'success' };

      (readContract as any).mockResolvedValue('10000000000000000'); // fee
      (writeContract as any).mockResolvedValue(mockHash);
      (waitForTransaction as any).mockResolvedValue(mockReceipt);

      const result = await openReward('1');

      expect(result.success).toBe(true);
      expect(result.txHash).toBe(mockHash);
      expect(writeContract).toHaveBeenCalledWith(
        expect.objectContaining({
          functionName: 'open',
          args: [true],
          value: '10000000000000000',
        })
      );
    });

    it('should handle transaction failures', async () => {
      (readContract as any).mockResolvedValue('10000000000000000');
      (writeContract as any).mockRejectedValue(new Error('Transaction failed'));

      const result = await openReward('1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Transaction failed');
    });

    it('should handle failed transaction receipts', async () => {
      const mockHash = '0xabcdef123456789';
      const mockReceipt = { status: 'reverted' };

      (readContract as any).mockResolvedValue('10000000000000000');
      (writeContract as any).mockResolvedValue(mockHash);
      (waitForTransaction as any).mockResolvedValue(mockReceipt);

      const result = await openReward('1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Transaction failed');
    });
  });
});