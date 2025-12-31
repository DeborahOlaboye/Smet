import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TimelockModule = buildModule("TimelockModule", (m) => {
  // 24 hours delay (in seconds)
  const delay = m.getParameter("delay", 24 * 60 * 60);
  
  // Deploy Timelock Contract
  const timelock = m.contract("Timelock", [delay]);
  
  return {
    timelock,
  };
});

export default TimelockModule;