// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract NowverUtils is Ownable, Pausable {
    /// @notice pause sets the pause state to true
    /// @dev can only be called by the contract owner
    function pause() public onlyOwner whenNotPaused {
        _pause();
    }

    /// @notice unpause sets the contract state to Unpaused
    /// @dev can only be called by the contract owner
    function unpause() public onlyOwner whenPaused {
        _unpause();
    }
}
