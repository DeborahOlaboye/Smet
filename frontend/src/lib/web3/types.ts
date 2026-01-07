export type EthAddress = `0x${string}`;

export interface OpenTxData {
  to: EthAddress;
  data: {
    method: string;
    args: any[];
    value: string;
  };
}
