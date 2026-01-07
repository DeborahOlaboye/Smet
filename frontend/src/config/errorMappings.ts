import { ErrorCode } from '@/types/errors';

export const CONTRACT_ERROR_MAPPINGS = {
  SmetReward: {
    'InsufficientPayment()': {
      code: 'INSUFFICIENT_FUNDS' as ErrorCode,
      userMessage: 'Insufficient payment to open reward box',
      severity: 'error' as const
    },
    'NoRewardsAvailable()': {
      code: 'CONTRACT_REVERT' as ErrorCode,
      userMessage: 'No rewards available in this box',
      severity: 'error' as const
    },
    'RewardBoxNotActive()': {
      code: 'CONTRACT_REVERT' as ErrorCode,
      userMessage: 'This reward box is not currently active',
      severity: 'error' as const
    },
    'MaxRewardsReached()': {
      code: 'CONTRACT_REVERT' as ErrorCode,
      userMessage: 'Maximum rewards for this box have been claimed',
      severity: 'error' as const
    }
  },
  SmetGold: {
    'ERC20InsufficientBalance': {
      code: 'INSUFFICIENT_FUNDS' as ErrorCode,
      userMessage: 'Insufficient SmetGold balance',
      severity: 'error' as const
    },
    'ERC20InsufficientAllowance': {
      code: 'CONTRACT_REVERT' as ErrorCode,
      userMessage: 'Token allowance not sufficient',
      severity: 'error' as const
    }
  },
  SmetHero: {
    'ERC721NonexistentToken': {
      code: 'INVALID_PARAMS' as ErrorCode,
      userMessage: 'Hero NFT does not exist',
      severity: 'error' as const
    },
    'ERC721InsufficientApproval': {
      code: 'CONTRACT_REVERT' as ErrorCode,
      userMessage: 'NFT not approved for transfer',
      severity: 'error' as const
    }
  },
  SmetLoot: {
    'ERC1155InsufficientBalance': {
      code: 'INSUFFICIENT_FUNDS' as ErrorCode,
      userMessage: 'Insufficient loot item balance',
      severity: 'error' as const
    },
    'ERC1155MissingApprovalForAll': {
      code: 'CONTRACT_REVERT' as ErrorCode,
      userMessage: 'Loot items not approved for transfer',
      severity: 'error' as const
    }
  }
} as const;

export function getContractErrorMapping(contract: string, errorSignature: string) {
  const contractMappings = CONTRACT_ERROR_MAPPINGS[contract as keyof typeof CONTRACT_ERROR_MAPPINGS];
  if (!contractMappings) return null;
  
  return contractMappings[errorSignature as keyof typeof contractMappings] || null;
}