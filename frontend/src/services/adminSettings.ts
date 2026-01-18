import { readContract, writeContract, waitForTransaction } from '@wagmi/core';
import { config } from '@/config/wagmi';
import { REWARD_CONTRACT_ADDRESS, REWARD_CONTRACT_ABI } from '@/config/contracts';

export interface ContractSettings {
  owner: string;
  isPaused: boolean;
  fee: bigint;
  timelock: string;
  vrfKeyHash: string;
  vrfSubId: string;
}

export async function fetchContractSettings(): Promise<ContractSettings> {
  try {
    const [owner, paused, fee, timelock] = await Promise.all([
      readContract(config, {
        address: REWARD_CONTRACT_ADDRESS,
        abi: REWARD_CONTRACT_ABI,
        functionName: 'owner',
      }),
      readContract(config, {
        address: REWARD_CONTRACT_ADDRESS,
        abi: REWARD_CONTRACT_ABI,
        functionName: 'paused',
      }),
      readContract(config, {
        address: REWARD_CONTRACT_ADDRESS,
        abi: REWARD_CONTRACT_ABI,
        functionName: 'fee',
      }),
      readContract(config, {
        address: REWARD_CONTRACT_ADDRESS,
        abi: REWARD_CONTRACT_ABI,
        functionName: 'timelock',
      }),
    ]);

    return {
      owner: owner as string,
      isPaused: paused as boolean,
      fee: fee as bigint,
      timelock: timelock as string,
      vrfKeyHash: '0x', // These are immutable, would need ABI parsing
      vrfSubId: '0', // These are immutable, would need ABI parsing
    };
  } catch (error) {
    console.error('Error fetching contract settings:', error);
    throw new Error('Failed to fetch contract settings');
  }
}

export async function pauseContract(): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const txHash = await writeContract(config, {
      address: REWARD_CONTRACT_ADDRESS,
      abi: REWARD_CONTRACT_ABI,
      functionName: 'pause',
    });

    await waitForTransaction(config, { hash: txHash });
    return { success: true, txHash };
  } catch (error: any) {
    console.error('Error pausing contract:', error);
    return { success: false, error: error.message || 'Failed to pause contract' };
  }
}

export async function unpauseContract(): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const txHash = await writeContract(config, {
      address: REWARD_CONTRACT_ADDRESS,
      abi: REWARD_CONTRACT_ABI,
      functionName: 'unpause',
    });

    await waitForTransaction(config, { hash: txHash });
    return { success: true, txHash };
  } catch (error: any) {
    console.error('Error unpausing contract:', error);
    return { success: false, error: error.message || 'Failed to unpause contract' };
  }
}

export async function withdrawFunds(
  token: string | null,
  amount: string
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const withdrawAmount = BigInt(amount);
    
    if (token && token !== '0x0000000000000000000000000000000000000000') {
      // Withdraw ERC20
      const txHash = await writeContract(config, {
        address: REWARD_CONTRACT_ADDRESS,
        abi: REWARD_CONTRACT_ABI,
        functionName: 'withdrawToken',
        args: [token, withdrawAmount],
      });
      await waitForTransaction(config, { hash: txHash });
    } else {
      // Withdraw native token
      const txHash = await writeContract(config, {
        address: REWARD_CONTRACT_ADDRESS,
        abi: REWARD_CONTRACT_ABI,
        functionName: 'withdraw',
        args: [withdrawAmount],
      });
      await waitForTransaction(config, { hash: txHash });
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error withdrawing funds:', error);
    return { success: false, error: error.message || 'Failed to withdraw funds' };
  }
}

export async function setTimelock(newTimelock: string): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    if (!newTimelock || !newTimelock.startsWith('0x')) {
      return { success: false, error: 'Invalid timelock address' };
    }

    const txHash = await writeContract(config, {
      address: REWARD_CONTRACT_ADDRESS,
      abi: REWARD_CONTRACT_ABI,
      functionName: 'setTimelock',
      args: [newTimelock],
    });

    await waitForTransaction(config, { hash: txHash });
    return { success: true, txHash };
  } catch (error: any) {
    console.error('Error setting timelock:', error);
    return { success: false, error: error.message || 'Failed to set timelock' };
  }
}

export async function getContractBalance(): Promise<bigint> {
  try {
    // This would typically use getBalance from ethers/viem
    return BigInt(0);
  } catch (error) {
    console.error('Error getting contract balance:', error);
    return BigInt(0);
  }
}

export async function getNetworkInfo(): Promise<{ chainId: number; chainName: string }> {
  try {
    const chainId = config.chains[0]?.id || 4242;
    const chainName = config.chains[0]?.name || 'Lisk Sepolia';
    return { chainId, chainName };
  } catch (error) {
    console.error('Error getting network info:', error);
    return { chainId: 4242, chainName: 'Lisk Sepolia' };
  }
}
