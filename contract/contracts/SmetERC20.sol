// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SmetGold is ERC20, Ownable {
    address public timelock;
    
    modifier onlyTimelock() {
        require(msg.sender == timelock, "Only timelock");
        _;
    }
    
    event TimelockSet(address indexed timelock);
    event TokensMinted(address indexed to, uint256 amount);
    
    constructor() ERC20("SmetGold", "SGOLD") Ownable(msg.sender) {
        _mint(msg.sender, 10000000 ether);
        emit TokensMinted(msg.sender, 10000000 ether, msg.sender);
    }
    
    function setTimelock(address _timelock) external onlyOwner {
        timelock = _timelock;
        emit TimelockSet(_timelock);
    }
    
    function mint(address to, uint256 amount) external onlyTimelock {
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
}
