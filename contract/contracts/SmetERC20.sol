// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title SmetGold
 * @notice Minimal ERC20 token used as an in-game currency for rewards.
 * @dev Mints a fixed initial supply to the deployer for seeding the prize pool.
 */
contract SmetGold is ERC20 {
    /** @notice Initial mint supply given to the deployer (in wei). */
    uint256 public constant INITIAL_SUPPLY = 10000000 ether;

    /**
     * @notice Deploy the SmetGold token and mint the initial supply to deployer.
     */
    constructor() ERC20("SmetGold", "SGOLD") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
} 