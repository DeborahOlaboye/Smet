// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SmetGold is ERC20 {
    uint256 private constant INITIAL_SUPPLY = 10000000 ether;
    uint256 private immutable deploymentTimestamp;
    
    constructor() ERC20("SmetGold", "SGOLD") {
        deploymentTimestamp = block.timestamp;
        _mint(msg.sender, INITIAL_SUPPLY);
        
        // Formal verification: Total supply invariant
        assert(totalSupply() == INITIAL_SUPPLY);
        assert(balanceOf(msg.sender) == INITIAL_SUPPLY);
    }
    
    function transfer(address to, uint256 amount) public override returns (bool) {
        address owner = _msgSender();
        uint256 senderBalanceBefore = balanceOf(owner);
        uint256 recipientBalanceBefore = balanceOf(to);
        uint256 totalSupplyBefore = totalSupply();
        
        bool result = super.transfer(to, amount);
        
        // Formal verification: Balance conservation
        if (owner != to) {
            assert(balanceOf(owner) == senderBalanceBefore - amount);
            assert(balanceOf(to) == recipientBalanceBefore + amount);
        }
        assert(totalSupply() == totalSupplyBefore);
        
        return result;
    }
    
    function approve(address spender, uint256 amount) public override returns (bool) {
        address owner = _msgSender();
        
        bool result = super.approve(spender, amount);
        
        // Formal verification: Allowance correctness
        assert(allowance(owner, spender) == amount);
        
        return result;
    }