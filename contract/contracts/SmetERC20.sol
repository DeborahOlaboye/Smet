// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SmetGold is ERC20 {
    // Simple ERC20 token used as in-game currency for reward distribution.
    // We mint a fixed initial supply to the deployer for seeding the prize pool
    // and other game mechanics.
    constructor() ERC20("SmetGold", "SGOLD") {
        _mint(msg.sender, 10000000 ether);
    }
}