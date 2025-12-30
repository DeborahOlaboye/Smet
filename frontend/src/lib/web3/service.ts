import type { Abi } from 'abitype';
import type { Provider } from '@wagmi/core';
import { getRewardContractConfig } from './contracts';

export class SmetRewardService {
  address: `0x${string}`;
  abi: Abi;

  constructor() {
    const { address, abi } = getRewardContractConfig();
    this.address = address;
    // @ts-ignore
    this.abi = abi;
  }

  // Example helper that formats the calldata for opening a reward
  public getOpenTxData(paymentInNative = true, priceInEther = '0.01') {
    // IMPORTANT: This is a lightweight helper; actual tx creation should be done with a signer/provider
    // typed OpenTxData
    return {
      to: this.address,
      data: {
        method: 'open',
        args: [paymentInNative],
        value: priceInEther,
      },
    };
  }

  // Placeholder for reading methods using a provider; left small to keep unit-testable
  public async readTotalOpened(provider: Provider | undefined): Promise<number> {
    if (!provider) return 0;
    // Implementation should call contract via provider; returning 0 for now to keep tests deterministic
    return 0;
  }
}
