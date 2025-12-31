// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "../SmetERC20.sol";

/**
 * @title Echidna harness for SmetGold
 * @notice Simple Echidna fuzzing harness demonstrating an invariant: the
 * total supply of `SmetGold` should remain constant after arbitrary transfers.
 */
contract EchidnaSmetGold {
    SmetGold public gold;

    constructor() {
        gold = new SmetGold();
    }

    // Invariant: total supply never changes
    function echidna_total_supply_unchanged() public view returns (bool) {
        return gold.totalSupply() == 10000000 ether;
    }

    // Fuzzing entrypoint: attempt transfers from the harness contract (which
    // initially holds the initial supply) to arbitrary addresses and amounts.
    function fuzz_transfer(address to, uint256 amount) public returns (bool) {
        // We intentionally ignore reverts here; Echidna treats reverts as failing
        // execution of that path but will continue exploring other inputs.
        // Call via low-level to avoid bubbling reverts.
        (bool success, ) = address(gold).call(abi.encodeWithSignature("transfer(address,uint256)", to, amount));
        success; // silence unused warning
        return true;
    }
}
