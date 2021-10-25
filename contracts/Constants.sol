// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

/// @title contains contsants to be used in the IkonDAO

abstract contract Constants  {

    /// @notice ACCESS CONTROL CONSTANTS
    bytes32 internal constant ADMIN_ROLE = keccak256("IKONDAO_ADMIN_ROLE");
    bytes32 internal constant MEMBER_ROLE = keccak256("IKONDAO_MEMBER_ROLE");
    bytes32 internal constant BANNED_ROLE = keccak256("IKONDAO_BANNED_ROLE");
    
    /// @notice module names
    bytes32 internal constant GOVERNOR_MODULE = keccak256("IKONDAO_GOVERNOR_MODULE");
    bytes32 internal constant GOVERNOR_COUNT_MODULE = keccak256("IKONDAO_GOVERNOR_COUNT_MODULE");

}