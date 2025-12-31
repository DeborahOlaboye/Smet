// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SmetGold is ERC20 {
    event BatchTransferCompleted(address indexed sender, uint256 count);
    event BatchApprovalCompleted(address indexed sender, uint256 count);

    constructor() ERC20("SmetGold", "SGOLD") {
        _mint(msg.sender, 10000000 ether);
    }

    function batchTransfer(address[] calldata recipients, uint256[] calldata amounts) external {
        require(recipients.length == amounts.length, "Length mismatch");
        for (uint256 i = 0; i < recipients.length; i++) {
            transfer(recipients[i], amounts[i]);
        }
        emit BatchTransferCompleted(msg.sender, recipients.length);
    }

    function batchApprove(address[] calldata spenders, uint256[] calldata amounts) external {
        require(spenders.length == amounts.length, "Length mismatch");
        for (uint256 i = 0; i < spenders.length; i++) {
            approve(spenders[i], amounts[i]);
        }
        emit BatchApprovalCompleted(msg.sender, spenders.length);
    }

    function batchTransferFrom(address[] calldata from, address[] calldata to, uint256[] calldata amounts) external {
        require(from.length == to.length && to.length == amounts.length, "Length mismatch");
        for (uint256 i = 0; i < from.length; i++) {
            transferFrom(from[i], to[i], amounts[i]);
        }
    }
}