// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./CircuitBreaker.sol";

contract EmergencyCircuitBreakerManager is Ownable {
    struct ContractInfo {
        address contractAddress;
        string name;
        bool isActive;
    }
    
    ContractInfo[] public contracts;
    mapping(address => uint256) public contractIndex;
    mapping(address => bool) public emergencyOperators;
    
    event ContractRegistered(address indexed contractAddress, string name);
    event ContractDeregistered(address indexed contractAddress);
    event EmergencyBreakAll(address indexed operator);
    event EmergencyRestoreAll(address indexed operator);
    event OperatorAdded(address indexed operator);
    event OperatorRemoved(address indexed operator);

    constructor() Ownable(msg.sender) {}

    function registerContract(address contractAddress, string memory name) external onlyOwner {
        require(contractAddress != address(0), "Invalid address");
        require(!_isRegistered(contractAddress), "Already registered");
        
        contracts.push(ContractInfo({
            contractAddress: contractAddress,
            name: name,
            isActive: true
        }));
        
        contractIndex[contractAddress] = contracts.length - 1;
        emit ContractRegistered(contractAddress, name);
    }

    function deregisterContract(address contractAddress) external onlyOwner {
        require(_isRegistered(contractAddress), "Not registered");
        
        uint256 index = contractIndex[contractAddress];
        uint256 lastIndex = contracts.length - 1;
        
        if (index != lastIndex) {
            contracts[index] = contracts[lastIndex];
            contractIndex[contracts[index].contractAddress] = index;
        }
        
        contracts.pop();
        delete contractIndex[contractAddress];
        emit ContractDeregistered(contractAddress);
    }

    function emergencyBreakAll(bytes4 functionSelector) external {
        require(emergencyOperators[msg.sender] || msg.sender == owner(), "Unauthorized");
        
        for (uint256 i = 0; i < contracts.length; i++) {
            if (contracts[i].isActive) {
                CircuitBreaker(contracts[i].contractAddress).breakCircuit(functionSelector);
            }
        }
        
        emit EmergencyBreakAll(msg.sender);
    }

    function emergencyRestoreAll(bytes4 functionSelector) external onlyOwner {
        for (uint256 i = 0; i < contracts.length; i++) {
            if (contracts[i].isActive) {
                CircuitBreaker(contracts[i].contractAddress).restoreCircuit(functionSelector);
            }
        }
        
        emit EmergencyRestoreAll(msg.sender);
    }

    function addEmergencyOperator(address operator) external onlyOwner {
        emergencyOperators[operator] = true;
        emit OperatorAdded(operator);
    }

    function removeEmergencyOperator(address operator) external onlyOwner {
        emergencyOperators[operator] = false;
        emit OperatorRemoved(operator);
    }

    function getContractCount() external view returns (uint256) {
        return contracts.length;
    }

    function _isRegistered(address contractAddress) private view returns (bool) {
        if (contracts.length == 0) return false;
        return contracts[contractIndex[contractAddress]].contractAddress == contractAddress;
    }
}