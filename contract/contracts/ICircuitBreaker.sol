// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

interface ICircuitBreaker {
    event CircuitBroken(bytes4 indexed functionSelector, address indexed breaker);
    event CircuitRestored(bytes4 indexed functionSelector, address indexed restorer);
    event BreakerAuthorized(address indexed breaker);
    event BreakerRevoked(address indexed breaker);

    function breakCircuit(bytes4 functionSelector) external;
    function restoreCircuit(bytes4 functionSelector) external;
    function isCircuitBroken(bytes4 functionSelector) external view returns (bool);
    function authorizeBreaker(address breaker) external;
    function revokeBreaker(address breaker) external;
    function isAuthorizedBreaker(address breaker) external view returns (bool);
}