// Replace with your actual contract ABI and address
import { SmetReward } from '@/contracts/abis/SmetReward';

export const REWARD_CONTRACT_ADDRESS = '0x...' as `0x${string}`; // Replace with your contract address
export const REWARD_CONTRACT_ABI = SmetReward.abi;

// For local development with Hardhat
export const isLocalDevelopment = process.env.NEXT_PUBLIC_NETWORK === 'localhost';

if (isLocalDevelopment) {
  // Use localhost contract address in development
  // This should match the address from your local deployment
  // @ts-ignore
  REWARD_CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as `0x${string}`;
}
