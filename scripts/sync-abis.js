import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'contract/ignition/deployments/sepolia-deployment/artifacts';
const FRONTEND_ABI_DIR = 'frontend/src/contracts/abis';

const CONTRACT_MAP = {
  'SmetRewardModule#SmetReward.json': 'SmetReward.json',
  'SmetRewardModule#SmetGold.json': 'SmetERC20.json',
  'SmetRewardModule#SmetHero.json': 'SmetERC721.json',
  'SmetRewardModule#SmetLoot.json': 'SmetERC1155.json',
};

if (!fs.existsSync(FRONTEND_ABI_DIR)) {
  fs.mkdirSync(FRONTEND_ABI_DIR, { recursive: true });
}

Object.entries(CONTRACT_MAP).forEach(([source, target]) => {
  const sourcePath = path.join(ARTIFACTS_DIR, source);
  const targetPath = path.join(FRONTEND_ABI_DIR, target);

  if (fs.existsSync(sourcePath)) {
    const artifact = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
    fs.writeFileSync(targetPath, JSON.stringify(artifact.abi, null, 2));
    console.log(`Synced ${source} -> ${target}`);
  } else {
    console.warn(`Source artifact not found: ${sourcePath}`);
  }
});
