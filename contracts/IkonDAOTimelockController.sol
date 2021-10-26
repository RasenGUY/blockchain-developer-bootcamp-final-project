// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

/// @title Ikon DAO TimelockController  
/// @author Fernando M. Trouw
/// @notice wraps around the IkonDAO to implement delays between proposals 
/// @notice this contract should be used for basic simulation purposes only 
/// @notice this contract is an experimental contract and should not be used to initiate project that will hold real value
/// @dev functions currently implemented (other then imported library) functions could contain side-effects

import "@openzeppelin/contracts/governance/TimelockController.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract IkonDAOTimelockController is Ownable, TimelockController {

    constructor(uint256 minDelay, address[] memory proposers, address[] memory executors) 
    TimelockController(minDelay, proposers, executors) {}
    
}