// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract SmetLoot is ERC1155 {
    mapping(uint256 => uint256) private totalSupplyById;
    
    constructor() ERC1155("https://loot.example/{id}.json") {}

    function mint(address to, uint256 id, uint256 amount) external {
        uint256 previousBalance = balanceOf(to, id);
        uint256 previousTotalSupply = totalSupplyById[id];
        
        _mint(to, id, amount, "");
        totalSupplyById[id] += amount;
        
        // Formal verification: Mint correctness
        assert(balanceOf(to, id) == previousBalance + amount);
        assert(totalSupplyById[id] == previousTotalSupply + amount);
    }
    
    function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes memory data) public override {
        uint256 fromBalanceBefore = balanceOf(from, id);
        uint256 toBalanceBefore = balanceOf(to, id);
        uint256 totalSupplyBefore = totalSupplyById[id];
        
        super.safeTransferFrom(from, to, id, amount, data);
        
        // Formal verification: Transfer correctness
        if (from != to) {
            assert(balanceOf(from, id) == fromBalanceBefore - amount);
            assert(balanceOf(to, id) == toBalanceBefore + amount);
        }
        assert(totalSupplyById[id] == totalSupplyBefore);
    }
}