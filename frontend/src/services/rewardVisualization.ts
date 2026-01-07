import { ethers } from 'ethers';

export interface RewardData {
  id: number;
  name: string;
  type: string;
  probability: number;
  weight: number;
  claimed: number;
  value: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface DistributionData {
  rewardId: number;
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface ProbabilityData {
  rewardIndex: number;
  weight: number;
  probability: number;
  expectedValue: number;
}

class RewardVisualizationService {
  private provider: ethers.Provider | null = null;
  private analyticsContract: ethers.Contract | null = null;
  private rewardContract: ethers.Contract | null = null;

  async initialize(provider: ethers.Provider, analyticsAddress: string, rewardAddress: string) {
    this.provider = provider;
    
    const analyticsAbi = [
      'function getRewardDistribution(address contract_, uint256 maxRewards) view returns (uint256[])',
      'function getContractStats(address contract_) view returns (uint256 totalOpened, uint256 totalClaimed, uint256 totalValue)',
      'function calculateProbabilities(uint32[] weights) pure returns (tuple(uint256 rewardIndex, uint32 weight, uint256 probability)[])',
      'event RewardOpened(address indexed contract_, address indexed user, uint256 rewardIndex)'
    ];

    const rewardAbi = [
      'function cdf(uint256) view returns (uint32)',
      'function prizePool(uint256) view returns (tuple(uint8 assetType, address token, uint256 idOrAmount))',
      'function fee() view returns (uint256)'
    ];

    this.analyticsContract = new ethers.Contract(analyticsAddress, analyticsAbi, provider);
    this.rewardContract = new ethers.Contract(rewardAddress, rewardAbi, provider);
  }

  async getRewardDistribution(maxRewards: number = 10): Promise<DistributionData[]> {
    if (!this.analyticsContract || !this.rewardContract) {
      throw new Error('Service not initialized');
    }

    try {
      const distribution = await this.analyticsContract.getRewardDistribution(
        await this.rewardContract.getAddress(),
        maxRewards
      );

      const total = distribution.reduce((sum: number, count: bigint) => sum + Number(count), 0);
      
      return distribution.map((count: bigint, index: number) => ({
        rewardId: index,
        name: `Reward ${index + 1}`,
        count: Number(count),
        percentage: total > 0 ? (Number(count) / total) * 100 : 0,
        color: this.getRewardColor(index)
      }));
    } catch (error) {
      console.error('Error fetching reward distribution:', error);
      throw error;
    }
  }

  async getProbabilityData(): Promise<ProbabilityData[]> {
    if (!this.rewardContract) {
      throw new Error('Service not initialized');
    }

    try {
      // Get CDF values to calculate weights
      const weights: number[] = [];
      let previousCdf = 0;
      
      for (let i = 0; i < 10; i++) { // Assuming max 10 rewards
        try {
          const cdf = await this.rewardContract.cdf(i);
          const weight = Number(cdf) - previousCdf;
          if (weight > 0) {
            weights.push(weight);
            previousCdf = Number(cdf);
          } else {
            break;
          }
        } catch {
          break;
        }
      }

      const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
      
      return weights.map((weight, index) => ({
        rewardIndex: index,
        weight,
        probability: (weight / totalWeight) * 100,
        expectedValue: this.calculateExpectedValue(weight, totalWeight)
      }));
    } catch (error) {
      console.error('Error fetching probability data:', error);
      throw error;
    }
  }

  async getContractStats(): Promise<{ totalOpened: number; totalClaimed: number; totalValue: string }> {
    if (!this.analyticsContract || !this.rewardContract) {
      throw new Error('Service not initialized');
    }

    try {
      const [totalOpened, totalClaimed, totalValue] = await this.analyticsContract.getContractStats(
        await this.rewardContract.getAddress()
      );

      return {
        totalOpened: Number(totalOpened),
        totalClaimed: Number(totalClaimed),
        totalValue: ethers.formatEther(totalValue)
      };
    } catch (error) {
      console.error('Error fetching contract stats:', error);
      throw error;
    }
  }

  async getRewardFee(): Promise<string> {
    if (!this.rewardContract) {
      throw new Error('Service not initialized');
    }

    try {
      const fee = await this.rewardContract.fee();
      return ethers.formatEther(fee);
    } catch (error) {
      console.error('Error fetching reward fee:', error);
      throw error;
    }
  }

  private getRewardColor(index: number): string {
    const colors = [
      '#3B82F6', // Blue
      '#10B981', // Green
      '#F59E0B', // Yellow
      '#EF4444', // Red
      '#8B5CF6', // Purple
      '#06B6D4', // Cyan
      '#F97316', // Orange
      '#84CC16', // Lime
      '#EC4899', // Pink
      '#6B7280'  // Gray
    ];
    return colors[index % colors.length];
  }

  private calculateExpectedValue(weight: number, totalWeight: number): number {
    // Simple expected value calculation based on probability
    const probability = weight / totalWeight;
    return probability * 100; // Scaled for display
  }

  formatProbability(probability: number): string {
    return `${probability.toFixed(2)}%`;
  }

  formatCount(count: number): string {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  }

  getRarityFromProbability(probability: number): 'common' | 'rare' | 'epic' | 'legendary' {
    if (probability >= 50) return 'common';
    if (probability >= 20) return 'rare';
    if (probability >= 5) return 'epic';
    return 'legendary';
  }

  getRarityColor(rarity: 'common' | 'rare' | 'epic' | 'legendary'): string {
    const colors = {
      common: '#6B7280',
      rare: '#3B82F6',
      epic: '#8B5CF6',
      legendary: '#F59E0B'
    };
    return colors[rarity];
  }
}

export const rewardVisualizationService = new RewardVisualizationService();