// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

/// @title The IKONDAO - a distributed collective for icon, vector graphics, animated svg's creators and creative artists
/// @author Fernando M. Trouw
/// @notice this contract experimental 
/// @notice this contract is an experimental contract and should not be used to initiate project that will hold real value

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/governance/TimelockController.sol";

import "./IkonDAOGovernor.sol";
import "./IkonDAOGovernanceToken.sol";
import "./Constants.sol";

contract IkonDAO is OwnableUpgradeable, UUPSUpgradeable {
    IkonDAOGovernor private _governor;
    IkonDAOGovernanceToken private _govToken;
    TimelockController private _daoTimelock;
    
    /// @notice initializes ikonDAO
    function __IkonDAO_init(address _govTokenAddress, address _daoGovernor, address _daoTimelockAddress) external initializer(){
        _govToken = IkonDAOGovernanceToken(_govTokenAddress);
        _daoTimelock = TimelockController(payable(_daoTimelockAddress));
        _governor = IkonDAOGovernor(_daoGovernor);
    }
    
    function _authorizeUpgrade(address newImplementation) internal onlyOwner override{}
}