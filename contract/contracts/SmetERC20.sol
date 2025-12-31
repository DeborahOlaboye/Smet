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