// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./InputValidator.sol";

contract SmetGold is ERC20 {
    using InputValidator for address;
    using InputValidator for uint256;
    
    constructor() ERC20("SmetGold", "SGOLD") {
        _mint(msg.sender, 10000000 ether);
    }
    
    function transfer(address to, uint256 amount) public override returns (bool) {
        InputValidator.validateAddress(to);
        InputValidator.validateAmount(amount);
        return super.transfer(to, amount);
    }
    
    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        InputValidator.validateAddress(from);
        InputValidator.validateAddress(to);
        InputValidator.validateAmount(amount);
        return super.transferFrom(from, to, amount);
    }
    
    function approve(address spender, uint256 amount) public override returns (bool) {
        InputValidator.validateAddress(spender);
        return super.approve(spender, amount);
    }
    
    function batchTransfer(address[] calldata recipients, uint256[] calldata amounts) external {
        InputValidator.validateArrayLength(recipients.length);
        InputValidator.validateArrayLengths(recipients.length, amounts.length);
        for (uint256 i = 0; i < recipients.length; i++) {
            InputValidator.validateAddress(recipients[i]);
            InputValidator.validateAmount(amounts[i]);
        }
        for (uint256 i = 0; i < recipients.length; i++) {
            transfer(recipients[i], amounts[i]);
        }
    }
    
    function batchApprove(address[] calldata spenders, uint256[] calldata amounts) external {
        InputValidator.validateArrayLength(spenders.length);
        InputValidator.validateArrayLengths(spenders.length, amounts.length);
        for (uint256 i = 0; i < spenders.length; i++) {
            InputValidator.validateAddress(spenders[i]);
        }
        for (uint256 i = 0; i < spenders.length; i++) {
            approve(spenders[i], amounts[i]);
        }
    }