# Emergency Recovery Quick Reference

## 🚨 IMMEDIATE RESPONSE (Critical Issues)

### Step 1: Pause All Operations
```bash
# Run emergency response script
npx hardhat run scripts/emergency-response.ts --network <network>
```

### Step 2: Assess the Situation
```bash
# Run health check
npx hardhat run scripts/emergency-monitor.ts --network <network>
```

### Step 3: Deploy Emergency Contracts (if needed)
```bash
# Deploy emergency recovery system
npx hardhat ignition deploy ignition/modules/Emergency.ts --network <network>
```

## 📞 Emergency Contacts
- **Primary Admin**: Contract Owner
- **Secondary Admin**: Emergency Recovery Contract
- **Development Team**: [Contact Information]

## 🔧 Available Emergency Functions

### SmetReward Contract
- `pause()` - Stop all reward operations
- `unpause()` - Resume operations
- `emergencyWithdraw(token, amount)` - Withdraw stuck funds
- `setEmergencyRecovery(address)` - Set recovery contract

### Token Contracts (SmetGold, SmetHero, SmetLoot)
- `pause()` - Stop all transfers and minting
- `unpause()` - Resume operations
- `setEmergencyRecovery(address)` - Set recovery contract

### Emergency Recovery Contract
- `emergencyPause(target)` - Pause any contract
- `requestRecovery(target, data)` - Request recovery action
- `approveRecovery(requestId)` - Approve recovery (multi-sig)
- `executeRecovery(requestId)` - Execute approved recovery
- `recoverERC20/721/1155()` - Recover stuck tokens

## 🔍 Monitoring Commands

### Single Health Check
```bash
npx hardhat run scripts/emergency-monitor.ts --network <network>
```

### Continuous Monitoring
```bash
npx hardhat run scripts/emergency-monitor.ts --network <network> -- --continuous --interval 5
```

## 📋 Emergency Scenarios

### Scenario 1: Smart Contract Vulnerability
1. Run `emergency-response.ts` to pause all contracts
2. Assess vulnerability scope
3. Deploy patched contracts if needed
4. Use recovery functions to migrate funds

### Scenario 2: VRF Service Issues
1. Pause SmetReward contract
2. Check pending requests
3. Update VRF configuration
4. Resume operations when fixed

### Scenario 3: Token Contract Issues
1. Pause affected token contract
2. Stop minting operations
3. Coordinate user communications
4. Plan token migration if necessary

### Scenario 4: Governance Attack
1. Use multi-sig emergency functions
2. Revoke compromised roles
3. Transfer ownership to secure addresses
4. Implement additional safeguards

## 🔄 Recovery Procedures

### Fund Recovery
1. Identify at-risk funds
2. Use `emergencyWithdraw()` functions
3. Transfer to secure multi-sig
4. Plan user compensation

### Contract Migration
1. Deploy new contracts
2. Pause old contracts
3. Migrate state and funds
4. Update frontend
5. Communicate with users

## ⚡ Quick Commands Reference

```bash
# Emergency pause all contracts
npx hardhat run scripts/emergency-response.ts --network mainnet

# Health check
npx hardhat run scripts/emergency-monitor.ts --network mainnet

# Deploy emergency system
npx hardhat ignition deploy ignition/modules/Emergency.ts --network mainnet

# Unpause all contracts (when safe)
npx hardhat run scripts/emergency-response.ts --network mainnet -- --unpause
```

## 📝 Post-Incident Checklist
- [ ] Conduct post-mortem analysis
- [ ] Update security procedures
- [ ] Implement additional safeguards
- [ ] Compensate affected users
- [ ] Update emergency procedures
- [ ] Communicate resolution to community