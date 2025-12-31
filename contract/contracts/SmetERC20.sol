// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SmetGold is ERC20, Pausable, Ownable {
    address public emergencyRecovery;
    
    event EmergencyRecoverySet(address indexed recovery);
    
    constructor() ERC20("SmetGold", "SGOLD") Ownable(msg.sender) {
        _mint(msg.sender, 10000000 ether);
        emit TokensMinted(msg.sender, 10000000 ether, msg.sender);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function setEmergencyRecovery(address _emergencyRecovery) external onlyOwner {
        emergencyRecovery = _emergencyRecovery;
        emit EmergencyRecoverySet(_emergencyRecovery);
    }
    
    function transfer(address to, uint256 amount) public override whenNotPaused returns (bool) {
        return super.transfer(to, amount);
    }
    
    function transferFrom(address from, address to, uint256 amount) public override whenNotPaused returns (bool) {
        return super.transferFrom(from, to, amount);
    }
}
