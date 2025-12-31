import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const EmergencyModule = buildModule("EmergencyModule", (m) => {
  // Deploy Emergency Recovery Contract
  const emergencyRecovery = m.contract("EmergencyRecovery");
  
  // Deploy Circuit Breaker Contract
  const circuitBreaker = m.contract("CircuitBreaker");
  
  return {
    emergencyRecovery,
    circuitBreaker,
  };
});

export default EmergencyModule;