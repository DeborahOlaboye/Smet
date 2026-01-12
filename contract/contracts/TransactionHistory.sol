// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/access/Ownable.sol";

contract TransactionHistory is Ownable {
    struct Transaction {
        address user;
        address contractAddress;
        string action;
        uint256 amount;
        uint256 tokenId;
        bytes32 txHash;
        uint256 timestamp;
        uint256 blockNumber;
    }

    Transaction[] public transactions;
    mapping(address => uint256[]) public userTransactions;
    mapping(address => uint256) public userTransactionCount;

    event TransactionRecorded(
        uint256 indexed transactionId,
        address indexed user,
        address indexed contractAddress,
        string action,
        uint256 amount,
        uint256 tokenId
    );

    constructor() Ownable(msg.sender) {}

    function recordTransaction(
        address user,
        address contractAddress,
        string memory action,
        uint256 amount,
        uint256 tokenId
    ) external {
        uint256 transactionId = transactions.length;
        
        Transaction memory newTransaction = Transaction({
            user: user,
            contractAddress: contractAddress,
            action: action,
            amount: amount,
            tokenId: tokenId,
            txHash: blockhash(block.number - 1),
            timestamp: block.timestamp,
            blockNumber: block.number
        });

        transactions.push(newTransaction);
        userTransactions[user].push(transactionId);
        userTransactionCount[user]++;

        emit TransactionRecorded(
            transactionId,
            user,
            contractAddress,
            action,
            amount,
            tokenId
        );
    }

    function getUserTransactions(address user) external view returns (uint256[] memory) {
        return userTransactions[user];
    }

    function getTransaction(uint256 transactionId) external view returns (Transaction memory) {
        require(transactionId < transactions.length, "Invalid transaction ID");
        return transactions[transactionId];
    }

    function getUserTransactionsPaginated(
        address user,
        uint256 offset,
        uint256 limit
    ) external view returns (Transaction[] memory) {
        uint256[] memory userTxIds = userTransactions[user];
        uint256 length = userTxIds.length;
        
        if (offset >= length) {
            return new Transaction[](0);
        }

        uint256 end = offset + limit;
        if (end > length) {
            end = length;
        }

        Transaction[] memory result = new Transaction[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = transactions[userTxIds[length - 1 - i]]; // Reverse order (newest first)
        }

        return result;
    }

    function getTotalTransactions() external view returns (uint256) {
        return transactions.length;
    }
}