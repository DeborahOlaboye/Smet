// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

library VerificationHelpers {
    function verifyArrayBounds(uint256 index, uint256 arrayLength) internal pure {
        assert(index < arrayLength);
    }
    
    function verifyNonZeroAddress(address addr) internal pure {
        assert(addr != address(0));
    }
    
    function verifyPositiveAmount(uint256 amount) internal pure {
        assert(amount > 0);
    }
    
    function verifyBalanceConservation(
        uint256 balanceBefore1,
        uint256 balanceBefore2,
        uint256 balanceAfter1,
        uint256 balanceAfter2,
        uint256 amount
    ) internal pure {
        assert(balanceAfter1 == balanceBefore1 - amount);
        assert(balanceAfter2 == balanceBefore2 + amount);
    }
    
    function verifyTotalSupplyConservation(
        uint256 totalSupplyBefore,
        uint256 totalSupplyAfter
    ) internal pure {
        assert(totalSupplyBefore == totalSupplyAfter);
    }
}