export function isValidAddress(address: string): boolean {
  if (!address || typeof address !== 'string') return false;
  if (!address.startsWith('0x')) return false;
  if (address.length !== 42) return false;
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return false;
  return true;
}

export function formatAddress(address: string, length: number = 4): string {
  if (!address) return 'Not set';
  if (!isValidAddress(address)) return address;
  const start = address.slice(0, 2 + length);
  const end = address.slice(-length);
  return `${start}...${end}`;
}

export function isSameAddress(addr1: string, addr2: string): boolean {
  if (!addr1 || !addr2) return false;
  return addr1.toLowerCase() === addr2.toLowerCase();
}

export function isZeroAddress(address: string): boolean {
  return isSameAddress(address, '0x0000000000000000000000000000000000000000');
}
