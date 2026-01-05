import { ProbabilityCalculator } from '@/lib/probabilityCalculator'

describe('ProbabilityCalculator', () => {
  const mockWeights = [
    { id: 0, name: 'Common', weight: 50, value: 10 },
    { id: 1, name: 'Rare', weight: 30, value: 25 },
    { id: 2, name: 'Epic', weight: 15, value: 50 },
    { id: 3, name: 'Legendary', weight: 5, value: 100 }
  ]

  describe('calculateProbabilities', () => {
    it('calculates probabilities correctly', () => {
      const results = ProbabilityCalculator.calculateProbabilities(mockWeights)
      
      expect(results).toHaveLength(4)
      expect(results[0].probability).toBe(50)
      expect(results[1].probability).toBe(30)
      expect(results[2].probability).toBe(15)
      expect(results[3].probability).toBe(5)
    })

    it('calculates cumulative probabilities correctly', () => {
      const results = ProbabilityCalculator.calculateProbabilities(mockWeights)
      
      expect(results[0].cumulativeProbability).toBe(50)
      expect(results[1].cumulativeProbability).toBe(80)
      expect(results[2].cumulativeProbability).toBe(95)
      expect(results[3].cumulativeProbability).toBe(100)
    })

    it('assigns correct rarity levels', () => {
      const results = ProbabilityCalculator.calculateProbabilities(mockWeights)
      
      expect(results[0].rarity).toBe('common')
      expect(results[1].rarity).toBe('rare')
      expect(results[2].rarity).toBe('epic')
      expect(results[3].rarity).toBe('legendary')
    })
  })

  describe('getRarityFromProbability', () => {
    it('returns correct rarity for different probabilities', () => {
      expect(ProbabilityCalculator.getRarityFromProbability(50)).toBe('common')
      expect(ProbabilityCalculator.getRarityFromProbability(25)).toBe('rare')
      expect(ProbabilityCalculator.getRarityFromProbability(15)).toBe('epic')
      expect(ProbabilityCalculator.getRarityFromProbability(5)).toBe('legendary')
    })
  })

  describe('simulateRewards', () => {
    it('returns simulation results', () => {
      const results = ProbabilityCalculator.simulateRewards(mockWeights, 1000)
      
      expect(Object.keys(results)).toHaveLength(4)
      expect(results[0]).toBeGreaterThan(0)
      expect(results[1]).toBeGreaterThan(0)
    })
  })

  describe('formatProbability', () => {
    it('formats probabilities correctly', () => {
      expect(ProbabilityCalculator.formatProbability(0.005)).toBe('<0.01%')
      expect(ProbabilityCalculator.formatProbability(0.5)).toBe('0.50%')
      expect(ProbabilityCalculator.formatProbability(25.5)).toBe('25.5%')
    })
  })

  describe('formatOdds', () => {
    it('formats odds correctly', () => {
      expect(ProbabilityCalculator.formatOdds(50)).toBe('1.0:1')
      expect(ProbabilityCalculator.formatOdds(25)).toBe('3.0:1')
      expect(ProbabilityCalculator.formatOdds(0)).toBe('∞:1')
    })
  })
})