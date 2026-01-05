import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();
  
  // Contract addresses (update with deployed addresses)
  const REWARD_CONTRACT = "0x..."; // Update with actual address
  const GOLD_TOKEN = "0x...";
  const HERO_NFT = "0x...";
  const LOOT_TOKEN = "0x...";
  
  const smetReward = await ethers.getContractAt("SmetReward", REWARD_CONTRACT);
  
  console.log("=== Smet Reward Pool Management Interface ===");
  console.log("Owner:", owner.address);
  console.log("Contract:", REWARD_CONTRACT);
  
  // Display current reward pool
  const rewardCount = await smetReward.getRewardCount();
  console.log("\n=== Current Reward Pool ===");
  console.log("Total Rewards:", rewardCount.toString());
  
  for (let i = 0; i < rewardCount; i++) {
    const reward = await smetReward.getReward(i);
    console.log(`Reward ${i}:`, {
      assetType: reward.assetType,
      token: reward.token,
      idOrAmount: reward.idOrAmount.toString()
    });
  }
  
  // Display current weights (CDF)
  const weights = await smetReward.getWeights();
  console.log("\n=== Current Weights (CDF) ===");
  weights.forEach((weight, index) => {
    console.log(`Weight ${index}:`, weight.toString());
  });
  
  // Example operations (uncomment to execute)
  
  // Add new ERC20 reward
  // console.log("\n=== Adding ERC20 Reward ===");
  // const newERC20Reward = {
  //   assetType: 1,
  //   token: GOLD_TOKEN,
  //   idOrAmount: ethers.parseEther("500")
  // };
  // await smetReward.addReward(newERC20Reward, 75);
  // console.log("Added ERC20 reward");
  
  // Add new ERC721 reward
  // console.log("\n=== Adding ERC721 Reward ===");
  // const newERC721Reward = {
  //   assetType: 2,
  //   token: HERO_NFT,
  //   idOrAmount: 2
  // };
  // await smetReward.addReward(newERC721Reward, 25);
  // console.log("Added ERC721 reward");
  
  // Add new ERC1155 reward
  // console.log("\n=== Adding ERC1155 Reward ===");
  // const newERC1155Reward = {
  //   assetType: 3,
  //   token: LOOT_TOKEN,
  //   idOrAmount: 99
  // };
  // await smetReward.addReward(newERC1155Reward, 50);
  // console.log("Added ERC1155 reward");
  
  // Update weights
  // console.log("\n=== Updating Weights ===");
  // const newWeights = [60, 30, 10]; // Adjust based on reward count
  // await smetReward.updateWeights(newWeights);
  // console.log("Updated weights");
  
  // Update fee
  // console.log("\n=== Updating Fee ===");
  // await smetReward.updateFee(ethers.parseEther("0.02"));
  // console.log("Updated fee to 0.02 ETH");
  
  // Remove reward (be careful with indices)
  // console.log("\n=== Removing Reward ===");
  // await smetReward.removeReward(0);
  // console.log("Removed reward at index 0");
  
  // Batch operations
  // console.log("\n=== Batch Add Rewards ===");
  // const batchRewards = [
  //   { assetType: 1, token: GOLD_TOKEN, idOrAmount: ethers.parseEther("200") },
  //   { assetType: 1, token: GOLD_TOKEN, idOrAmount: ethers.parseEther("1000") }
  // ];
  // const batchWeights = [40, 10];
  // await smetReward.addRewardsBatch(batchRewards, batchWeights);
  // console.log("Added batch rewards");
  
  // Check reward stock
  // console.log("\n=== Checking Reward Stock ===");
  // const goldStock = await smetReward.getRewardStock(GOLD_TOKEN, 0);
  // const lootStock = await smetReward.getRewardStock(LOOT_TOKEN, 77);
  // console.log("Gold Stock:", ethers.formatEther(goldStock));
  // console.log("Loot Stock (ID 77):", lootStock.toString());
  
  console.log("\n=== Management Complete ===");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });