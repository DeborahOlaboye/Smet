import { describe, it, expect, vi, beforeEach } from 'vitest'
import { rewardVisualizationService } from '@/services/rewardVisualization'

const mockContract = {
  getRewardDistribution: vi.fn(),
  getContractStats: vi.fn(),
  getAddress: vi.fn().mockResolvedValue('0x123'),
  cdf: vi.fn(),
  fee: vi.fn().mockResolvedValue(BigInt('10000000000000000'))
}

vi.mock('ethers', () => ({
  ethers: {
    Contract: vi.fn(() => mockContract),
    formatEther: vi.fn((value) => '0.01')
  }
}))

describe('RewardVisualizationService Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch reward distribution data', async () => {
    mockContract.getRewardDistribution.mockResolvedValue([
      BigInt(100), BigInt(50), BigInt(25)
    ])
    
    const mockProvider = {} as any
    await rewardVisualizationService.initialize(mockProvider, '0x123', '0x456')
    
    const distribution = await rewardVisualizationService.getRewardDistribution(3)
    
    expect(distribution).toHaveLength(3)
    expect(distribution[0].count).toBe(100)
    expect(distribution[1].count).toBe(50)
    expect(distribution[2].count).toBe(25)
  })

  it('should calculate percentages correctly', async () => {
    mockContract.getRewardDistribution.mockResolvedValue([
      BigInt(60), BigInt(30), BigInt(10)
    ])
    
    const mockProvider = {} as any
    await rewardVisualizationService.initialize(mockProvider, '0x123', '0x456')
    
    const distribution = await rewardVisualizationService.getRewardDistribution(3)
    
    expect(distribution[0].percentage).toBe(60)
    expect(distribution[1].percentage).toBe(30)
    expect(distribution[2].percentage).toBe(10)
  })
})