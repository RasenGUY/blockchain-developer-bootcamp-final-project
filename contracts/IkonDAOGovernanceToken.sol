// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

/// @title The IkonDAOGovernance Token - extension of the icond 
/// @author Fernando M. Trouw
/// @notice this contract should be used for basic simulation purposes only 
/// @notice this contract is an experimental contract and should not be used to initiate project that will hold real value
/// @dev functions currently implemented (other then imported library) functions could contain side-effects

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "./ERC20SnapshotModified.sol";

/// @custom:security-contact ftrouw@protonmail.com
contract IkonDAOGovernanceToken is ERC20, ERC20Burnable, ERC20SnapshotModified, Ownable, Pausable, ERC20Permit, ERC20Votes {

    /// @notice represents the maximum amount of votes a user can own 
    /// @notice represented with decimals
    /// @notice converted to - with decimals from the front end 
    uint private _weightLimitFraction; 
    uint private _baseRewardVotes;
    constructor(uint256 _fraction, address[] memory _initialUsers, uint256 _initialVotes, uint256 _baseRewards)
        ERC20("IkonDAOGovernanceToken", " IKD")
        ERC20Permit("IkonDAOGovernanceToken")
    {
        _weightLimitFraction = _fraction;
        _baseRewardVotes = _baseRewards;
        // _mint(msg.sender, 10000000 * 10 ** decimals());

        for (uint i = 0; i < _initialUsers.length; i++){
        _mint(_initialUsers[i], _initialVotes);
            // _govRewardVotes(_initialUsers[i], _initialVotes);
        }
    }
    
    /// @dev sets vote weight limit
    /// @param _fraction fraction to which the weight limit should be set  
    function setWeightLimitFraction(uint256 _fraction) external onlyOwner {
        _weightLimitFraction = _fraction; 
    }

    /// @dev returns weight limit of governance token
    function getWeightLimit() private view returns (uint256) {
        return totalSupply() * _weightLimitFraction;
    } 

    /// @dev calculates wheter receivers vote weight exceeds limit
    /// @param _receiver address of the contributor
    function weightLimitReached(address _receiver) private view returns (bool) {
        return balanceOf(_receiver) + _baseRewardVotes <= getWeightLimit() ? false : true;
    }
    
    function calculateRest(uint256 _accountSnapshotBalance) private view returns (uint256) {
        return getWeightLimit() - _accountSnapshotBalance;
    } 

    function govRewardVotes(address _to) external onlyOwner {
        _govRewardVotes(_to);
    }

    /// @dev mints reward tokens to contributors
    /// @param _to contributors address
    /// @notice checks first if weightlimit (maximumVotes) is breached
    /// @notice also checks if reward + account balance
    /// @notice use in constructor  
    function _govRewardVotes(address _to) private {
        /// @notice check if user balance is 0
        if (balanceOf(_to) != 0){
            /// @notice if its not then proceed with actions below
            /// @notice weight exceeds limit ?
            if (!weightLimitReached(_to)){
                mint(_to, _baseRewardVotes);
            } else {
                /// @notice mint rest reward to contributers
                mint(_to, calculateRest(getLatestSnapshotBalanceOf(_to)));
            }
        } else {
            mint(_to, _baseRewardVotes);
        }
    }

    function getLatestSnapshotBalanceOf (address _account) private view returns (uint256){
        return _getLatestSnapshotBalanceOf(_account);
    } 

    function snapshot() public onlyOwner {
        _snapshot();
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mint(address to, uint256 amount) private onlyOwner {
        _mint(to, amount);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override(ERC20, ERC20SnapshotModified)
    {
        super._beforeTokenTransfer(from, to, amount);
    }

    // The following functions are overrides required by Solidity.
    function _afterTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._burn(account, amount);
    }
}
