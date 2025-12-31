// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SmetGold is ERC20, Pausable, Ownable {
    constructor() ERC20("SmetGold", "SGOLD") Ownable(msg.sender) {
        _mint(msg.sender, 10000000 ether);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function transfer(address to, uint256 amount) public override whenNotPaused returns (bool) {
        return super.transfer(to, amount);
    }
    
    function transferFrom(address from, address to, uint256 amount) public override whenNotPaused returns (bool) {
        return super.transferFrom(from, to, amount);
    }
    
    function approve(address spender, uint256 amount) public override whenNotPaused returns (bool) {
        return super.approve(spender, amount);
    }