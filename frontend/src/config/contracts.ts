export const CONTRACT_ADDRESSES = {
  SmetGold: '0x0A8862B2d93105b6BD63ee2c9343E7966872a3D2' as `0x${string}`,
  SmetHero: '0x877D1FDa6a6b668b79ca4A42388E0825667d233E' as `0x${string}`,
  SmetLoot: '0xa5046538c6338DC8b52a22675338a4623D4B5475' as `0x${string}`,
  SmetReward: '0xeF85822c30D194c2B2F7cC17223C64292Bfe611b' as `0x${string}`,
} as const;

export const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
] as const;

export const ERC721_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function ownerOf(uint256 tokenId) view returns (address)',
] as const;

export const ERC1155_ABI = [
  'function balanceOf(address account, uint256 id) view returns (uint256)',
  'function balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])',
  'function uri(uint256 id) view returns (string)',
] as const;