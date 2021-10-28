// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

/// @title contains contsants to be used in the IkonDAO


import "@openzeppelin/contracts/governance/IGovernor.sol";

abstract contract Constants  {

    struct Proposal { 
        uint256 id;
        address proposer;
        IGovernor.ProposalState state;
    }
    
    /// @notice ACCESS CONTROL CONSTANTS
    bytes32 constant ADMIN_ROLE = keccak256("IKONDAO_ADMIN_ROLE");
    bytes32 constant MEMBER_ROLE = keccak256("IKONDAO_MEMBER_ROLE");
    bytes32 constant BANNED_ROLE = keccak256("IKONDAO_BANNED_ROLE");
    
    /// @notice description constants for proposals
    string constant DESC_SET_DELAY = "Governor: delay changed"; 

    /// @notice error messages
    string constant REQUIRE_CREATEMEMBER_ALREADY_CREATED = "IkonDAO: already a member"; 
    string constant REQUIRE_CREATEMEMBER_USER_BANNED = "IkonDAO: banned users cannot become members"; 
    string constant REQUIRE_BANMEMBER_ALREADY_BANNED = "IkonDAO: account already banned"; 
    string constant REQUIRE_BANMEMBER_ONLY_MEMBERS = "IkonDAO: non members cannot be banned";
     
}