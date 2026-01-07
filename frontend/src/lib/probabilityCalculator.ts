export interface RewardWeight {
  id: number;
  name: string;
  weight: number;
  value?: number;
}

export interface ProbabilityResult {
  id: number;
  name: string;
  weight: number;
  probability: number;
  cumulativeProbability: number;
  expectedValue: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export class ProbabilityCalculator {
  static calculateProbabilities(weights: RewardWeight[]): ProbabilityResult[] {
    const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
    
    if (totalWeight === 0) {
      throw new Error('Total weight cannot be zero');
    }

    let cumulativeWeight = 0;
    
    return weights.map(reward => {
      const probability = (reward.weight / totalWeight) * 100;
      cumulativeWeight += reward.weight;
      const cumulativeProbability = (cumulativeWeight / totalWeight) * 100;
      
      return {
        id: reward.id,
        name: reward.name,
        weight: reward.weight,
        probability,
        cumulativeProbability,
        expectedValue: this.calculateExpectedValue(probability, reward.value || 0),
        rarity: this.getRarityFromProbability(probability)
      };
    });
  }

  static calculateExpectedValue(probability: number, value: number): number {
    return (probability / 100) * value;
  }

  static getRarityFromProbability(probability: number): 'common' | 'rare' | 'epic' | 'legendary' {
    if (probability >= 40) return 'common';
    if (probability >= 20) return 'rare';
    if (probability >= 10) return 'epic';
    return 'legendary';
  }

  static getRarityColor(rarity: 'common' | 'rare' | 'epic' | 'legendary'): string {
    const colors = {
      common: '#6B7280',
      rare: '#3B82F6',
      epic: '#8B5CF6',
      legendary: '#F59E0B'
    };
    return colors[rarity];
  }

  static simulateRewards(weights: RewardWeight[], simulations: number = 10000): { [key: number]: number } {
    const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
    const results: { [key: number]: number } = {};
    
    // Initialize results
    weights.forEach(w => {
      results[w.id] = 0;
    });

    for (let i = 0; i < simulations; i++) {
      const random = Math.random() * totalWeight;
      let currentWeight = 0;
      
      for (const reward of weights) {
        currentWeight += reward.weight;
        if (random <= currentWeight) {
          results[reward.id]++;
          break;
        }
      }
    }

    return results;
  }

  static calculateHouseEdge(weights: RewardWeight[], entryFee: number): number {
    const probabilities = this.calculateProbabilities(weights);
    const totalExpectedValue = probabilities.reduce((sum, p) => {
      const rewardValue = weights.find(w => w.id === p.id)?.value || 0;
      return sum + p.expectedValue;
    }, 0);
    
    return ((entryFee - totalExpectedValue) / entryFee) * 100;
  }

  static getOptimalStrategy(weights: RewardWeight[], budget: number, entryFee: number): {
    maxPlays: number;
    expectedReturn: number;
    riskLevel: 'low' | 'medium' | 'high';
  } {
    const maxPlays = Math.floor(budget / entryFee);
    const probabilities = this.calculateProbabilities(weights);
    
    const expectedValuePerPlay = probabilities.reduce((sum, p) => {
      const rewardValue = weights.find(w => w.id === p.id)?.value || 0;
      return sum + (p.probability / 100) * rewardValue;
    }, 0);
    
    const expectedReturn = maxPlays * expectedValuePerPlay;
    const variance = this.calculateVariance(weights, expectedValuePerPlay);
    
    let riskLevel: 'low' | 'medium' | 'high' = 'medium';
    if (variance < 0.1) riskLevel = 'low';
    else if (variance > 0.5) riskLevel = 'high';
    
    return {
      maxPlays,
      expectedReturn,
      riskLevel
    };
  }

  private static calculateVariance(weights: RewardWeight[], expectedValue: number): number {
    const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
    
    const variance = weights.reduce((sum, reward) => {
      const probability = reward.weight / totalWeight;
      const value = reward.value || 0;
      const deviation = value - expectedValue;
      return sum + probability * (deviation * deviation);
    }, 0);
    
    return variance;
  }

  static formatProbability(probability: number): string {
    if (probability < 0.01) {
      return '<0.01%';
    } else if (probability < 1) {
      return `${probability.toFixed(2)}%`;
    } else {
      return `${probability.toFixed(1)}%`;
    }
  }

  static formatOdds(probability: number): string {
    if (probability === 0) return '∞:1';
    const odds = (100 / probability) - 1;
    return `${odds.toFixed(1)}:1`;
  }
}