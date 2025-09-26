
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("SmetRewardModule", (m) => {
  const gold = m.contract("SmetGold");
  const hero = m.contract("SmetHero");
  const loot = m.contract("SmetLoot");

  const subId   = BigInt("76299576001720126367375609685704751419295642142562879129066040777611788094942");
  const keyHash = "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae";
  const fee     = m.getParameter("fee", 50000000000000000n);
  const coordinator = "0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B";

  const prizes = [
    { assetType: 1, token: gold, idOrAmount: 500000000000000000000n },
    { assetType: 2, token: hero, idOrAmount: 1n },
    { assetType: 3, token: loot, idOrAmount: 77n },
  ];
  const weights = [60, 30, 10];

  const box = m.contract("SmetReward", [coordinator,subId, keyHash, fee, weights, prizes ]);

  m.call(gold, "transfer", [box, 10000000000000000000000n]);
  m.call(hero, "mint", [box]);
  m.call(loot, "mint", [box, 77, 100]);

  return { gold, hero, loot, box };
});