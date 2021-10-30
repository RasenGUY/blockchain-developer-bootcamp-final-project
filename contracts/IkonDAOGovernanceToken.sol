// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

/// @title The IkonDAOGovernance Token - extension of the icond 
/// @author Fernando M. Trouw
/// @notice this contract should be used for basic simulation purposes only 
/// @notice this contract is an experimental contract and should not be used to initiate project that will hold real value
/// @dev functions currently implemented (other then imported library) functions could contain side-effects

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";



/// @custom:security-contact ftrouw@protonmail.com
contract IkonDAOGovernanceToken is ERC20Burnable, ERC20Snapshot, Ownable, Pausable, ERC20Permit, ERC20Votes {

    /// @notice represents the maximum amount of votes a user can own 
    /// @notice represented with decimals
    /// @notice converted to - with decimals from the front end 
    uint private _weightLimitFraction; 
    uint private _baseRewardVotes;

    using SafeMath for *;

    event VotingPowerIncreased(address _receiver, uint256 _amount, string message);
    event VotingPowerSlashed(address _receiver, uint256 _amount, string message);

    constructor(uint256 _fraction, address[] memory _initialUsers, uint256 _initialVotes, uint256 _baseReward)
        ERC20("IkonDAOGovernanceToken", " IKD")
        ERC20Permit("IkonDAOGovernanceToken")
    {
        _weightLimitFraction = _fraction;
        _baseRewardVotes = _baseReward;
        // _mint(msg.sender, 10000000 * 10 ** decimals());

        for (uint i = 0; i < _initialUsers.length; i++){
            _mint(_initialUsers[i], _initialVotes);
            selfDelegate(_initialUsers[i]);
            // _govRewardVotes(_initialUsers[i], _initialVotes);
        }
        pause();
    }
    
    /// @dev sets vote weight limit
    /// @param _fraction fraction to which the weight limit should be set  
    function setWeightLimitFraction(uint256 _fraction) external onlyOwner {
        _weightLimitFraction = _fraction;   
    }

    /// @dev returns weight limit of governance token
    function getWeightLimit() public view returns (uint256) {
        uint256 x = totalSupply().mul(_weightLimitFraction);
        uint256 y = x.div(1 * 10 ** decimals());
        return y;
    } 

    /// @dev checks wheter limit is reached it is it returns rest that should be sent
    /// @param _receiver address of the contributor
    function weightLimitReached(address _receiver) public view returns (bool _reached, uint256) {
        uint256 limit = getWeightLimit();
        uint256 votes = getVotes(_receiver);
        return votes >= limit ? (_reached = true, 0) : (_reached = false, calculateRewards(votes, limit));
    }

    /// @dev calculates reward contribution
    /// @param votes voteWeight of account
    /// @param limit voteWeight limit  
    function calculateRewards(uint256 votes, uint256 limit) private view returns (uint256){
        return votes.add(_baseRewardVotes) <= limit ? _baseRewardVotes : limit - votes;
    }

    function rewardVotes(address _to) external onlyOwner {
        _rewardVotes(_to);
    }

    /// @dev mints reward tokens to contributors
    /// @param _to contributors address
    /// @notice checks first if weightlimit (maximumVotes) is breached
    /// @notice also checks if reward + account balance
    /// @notice use in constructor  
    function _rewardVotes(address _to) private {
        unpause(); // unpause the contract

        /// @notice check if user balance is 0
        if (getVotes(_to) != 0){
            /// @notice if its not then proceed with actions below
            /// @notice weight exceeds limit ?
            (bool limitReached, uint256 reward) = weightLimitReached(_to);
            if (limitReached){
            
                emit VotingPowerIncreased(_to, reward, "Can't level up for now, try helping others");
            
            } else {
                mint(_to, reward);
                selfDelegate(_to);
                emit VotingPowerIncreased(_to, reward, "Level up");
            }
 
        } else {
            mint(_to, _baseRewardVotes);
            selfDelegate(_to);
            emit VotingPowerIncreased(_to, _baseRewardVotes, "Level up");
        }

        pause(); // pause after reward distribution 
    }


    function selfDelegate(address delegatee) private {
        return _delegate(delegatee, delegatee);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mint(address to, uint256 amount) private onlyOwner whenNotPaused {
        super._mint(to, amount);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override(ERC20, ERC20Snapshot)
    {   
        _snapshot();
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
        override(ERC20, ERC20Votes) whenNotPaused
    {
        super._mint(to, amount);
        _snapshot();
    }

    function _burn(address account, uint256 amount)
        internal
        override(ERC20, ERC20Votes) whenNotPaused
    {
        super._burn(account, amount);
    }
    
    /// override delegate functions
    function delegate (address delgatee) public override {}
    function delegateBySig(address delegatee, uint256 nonce, uint256 expiry, uint8 v, bytes32 r, bytes32 s) public override {}
    
}
