// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

/// @title The IkonDAO Token - fungible token that powers the IkonDAO ecosystem 
/// @author Fernando M. Trouw
/// @notice this contract should be used for basic simulation purposes only 
/// @notice this contract is an experimental contract and should not be used to initiate project that will hold real value
/// @dev functions currently implemented (other then imported library) functions could contain side-effects

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "./Constants.sol";


/// @custom:security-contact ftrouw@protonmail.com
contract IkonDAOToken is ERC20, ERC20Burnable, ERC20Snapshot, AccessControl, ERC20Permit, Constants {
    
    uint256 _baseRewardTokens; 
    address private owner; 
    
    constructor(uint256 _baseRewards) ERC20("IkonDAO Token", "IKD") ERC20Permit("IkonDAO Token") {
        
        owner = _msgSender();
        _setupRole(ADMIN_ROLE, _msgSender());
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setupRole(SNAPSHOT_ROLE, _msgSender());
        _setRoleAdmin(SNAPSHOT_ROLE, ADMIN_ROLE);
        _mint(owner, 1000000 * 10 ** decimals());
        _setupRole(MINTER_ROLE, _msgSender());
        _setRoleAdmin(MINTER_ROLE, ADMIN_ROLE);
        
        /// @dev sets basereward
        _baseRewardTokens = _baseRewards;
    }

    /// @dev see _rewardTokens
    function rewardTokens(address to) external onlyRole(ADMIN_ROLE) {
        _rewardTokens(to);
    }

    /// @dev distributes rewards from dao to contributor
    /// @param _to address of the contributoraddress
    /// @notice incase balance is not enough for _baseReward tokens will be minted to owner
    function _rewardTokens(address _to) private {
        if (balanceOf(owner) < _baseRewardTokens){
            _mint(owner, _baseRewardTokens);
        }
        _transfer(owner, _to, _baseRewardTokens); 
    }   

    /// @dev returns base Token Rewards
    function getBaseReward() public view returns(uint256) {
        return _baseRewardTokens; 
    }

    /// @dev sets base Token Reward
    /// @param newBase is the amount to set rewards to 
    function setBaseReward(uint256 newBase) external onlyRole(ADMIN_ROLE) {
        _baseRewardTokens = newBase;
    }

    /// @dev for taking snapshots of rewards
    function snapshot() public onlyRole(SNAPSHOT_ROLE) {
        _snapshot();
    }

    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    // The following functions are overrides required by Solidity.
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Snapshot)
    {
        super._beforeTokenTransfer(from, to, amount);
    }

}