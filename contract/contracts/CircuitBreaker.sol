// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ICircuitBreaker.sol";

contract CircuitBreaker is Ownable, ICircuitBreaker {
    mapping(bytes4 => bool) private _circuitBroken;
    mapping(address => bool) private _authorizedBreakers;
    
    event CircuitBroken(bytes4 indexed functionSelector, address indexed breaker);
    event CircuitRestored(bytes4 indexed functionSelector, address indexed restorer);
    event BreakerAuthorized(address indexed breaker);
    event BreakerRevoked(address indexed breaker);

    constructor() Ownable(msg.sender) {}

    modifier circuitBreakerCheck(bytes4 functionSelector) {
        require(!_circuitBroken[functionSelector], "Circuit breaker: function disabled");
        _;
    }

    function breakCircuit(bytes4 functionSelector) external {
        require(_authorizedBreakers[msg.sender] || msg.sender == owner(), "Unauthorized");
        _circuitBroken[functionSelector] = true;
        emit CircuitBroken(functionSelector, msg.sender);
    }

    function restoreCircuit(bytes4 functionSelector) external onlyOwner {
        _circuitBroken[functionSelector] = false;
        emit CircuitRestored(functionSelector, msg.sender);
    }

    function isCircuitBroken(bytes4 functionSelector) external view returns (bool) {
        return _circuitBroken[functionSelector];
    }

    function authorizeBreaker(address breaker) external onlyOwner {
        _authorizedBreakers[breaker] = true;
        emit BreakerAuthorized(breaker);
    }

    function revokeBreaker(address breaker) external onlyOwner {
        _authorizedBreakers[breaker] = false;
        emit BreakerRevoked(breaker);
    }

    function isAuthorizedBreaker(address breaker) external view returns (bool) {
        return _authorizedBreakers[breaker];
    }
}