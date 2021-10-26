// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

/// @title The IKONDAO - a distributed collective for icon, vector graphics, animated svg's creators and creative artists
/// @author Fernando M. Trouw
/// @notice this contract experimental 
/// @notice this contract is an experimental contract and should not be used to initiate project that will hold real value

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/governance/TimelockController.sol";

import "./IkonDAOGovernor.sol";
import "./IkonDAOGovernanceToken.sol";
import "./IkonDAOToken.sol";
import "./Constants.sol";

contract IkonDAO is Constants, OwnableUpgradeable, AccessControlUpgradeable, UUPSUpgradeable {
    IkonDAOGovernor private _governor;
    IkonDAOToken private _daoToken; 
    IkonDAOGovernanceToken private _govToken;
    TimelockController private _daoTimelock;

    /// @notice unsafe allow     
    constructor (){} 

    /// @notice initializes ikonDAO
    function __IkonDAO_init(address _govTokenAddress, address _daoGovernor, address _daoTimelockAddress, address _ikonDaoToken) external initializer(){
        _govToken = IkonDAOGovernanceToken(_govTokenAddress);
        _daoTimelock = TimelockController(payable(_daoTimelockAddress));
        _governor = IkonDAOGovernor(_daoGovernor);
        _daoToken = IkonDAOToken(_ikonDaoToken);

        /// @notice setRoles
        _setupRole(ADMIN_ROLE, _msgSender());
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setRoleAdmin(MEMBER_ROLE, ADMIN_ROLE);
    }

    /// @dev returns governor version
    function getGovernorVersion() public view returns (string memory) {
        return _governor._version(); 
    }

    /// @notice upgrades to this contract
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(ADMIN_ROLE){}
}