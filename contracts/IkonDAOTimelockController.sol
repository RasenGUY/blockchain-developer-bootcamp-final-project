// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

/// @title Ikon DAO TimelockController  
/// @author Fernando M. Trouw
/// @notice wraps around the IkonDAO to implement delays between proposals 
/// @notice this contract toUnit(voteingPowerOfAlice)should be used for basic simulation purposes only 
/// @notice this contract is an experimental contract and shoutoUnit(voteingPowerOfAlice)ld not be used to initiate project that will hold real value
/// @dev functions currently implemented (other then imported library) functions could contain side-effects

import "@openzeppelin/contracts/governance/TimelockController.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract IkonDAOTimelockController is Ownable, TimelockController {

    constructor(uint256 minDelay, address[] memory proposers, address[] memory executors) 
    TimelockController(minDelay, proposers, executors) {}

    function isOperation(bytes32 id) public view override returns (bool pending) {
        return super.isOperation(id);
    }

    function isOperationPending(bytes32 id) public view override returns (bool pending) {
        return super.isOperation(id);
    }

    function isOperationReady(bytes32 id) public view override returns (bool ready) {
        return super.isOperationReady(id);
    }

    function isOperationDone(bytes32 id) public view override returns (bool done) {
        return super.isOperationDone(id);
    }

    function getTimestamp(bytes32 id) public view override returns (uint256 timestamp) {
        return super.getTimestamp(id);
    }

    function getMinDelay() public view override returns (uint256 duration) {
        return super.getMinDelay();
    }

    function hashOperation(
        address target,
        uint256 value,
        bytes calldata data,
        bytes32 predecessor,
        bytes32 salt
    ) public pure override returns (bytes32 hash) {
        return super.hashOperation(target, value, data, predecessor, salt);
    }

    function hashOperationBatch(
        address[] calldata targets,
        uint256[] calldata values,
        bytes[] calldata datas,
        bytes32 predecessor,
        bytes32 salt
    ) public pure override returns (bytes32 hash) {
        return super.hashOperationBatch(targets, values, datas, predecessor, salt);
    }

    function schedule(
        address target,
        uint256 value,
        bytes calldata data,
        bytes32 predecessor,
        bytes32 salt,
        uint256 delay
    ) public override onlyRole(PROPOSER_ROLE) {
        super.schedule(target, value, data, predecessor, salt, delay);
    }

    function scheduleBatch(
        address[] calldata targets,
        uint256[] calldata values,
        bytes[] calldata datas,
        bytes32 predecessor,
        bytes32 salt,
        uint256 delay
    ) public override onlyRole(PROPOSER_ROLE) {
        super.scheduleBatch(targets, values, datas, predecessor, salt, delay);
    }

    function cancel(bytes32 id) public override onlyRole(PROPOSER_ROLE) {
        super.cancel(id);
    }

    function execute(
        address target,
        uint256 value,
        bytes calldata data,
        bytes32 predecessor,
        bytes32 salt
    ) public payable override onlyRoleOrOpenRole(EXECUTOR_ROLE) {
        super.execute(target, value, data, predecessor, salt);
    }

     function executeBatch(
        address[] calldata targets,
        uint256[] calldata values,
        bytes[] calldata datas,
        bytes32 predecessor,
        bytes32 salt
    ) public payable override onlyRoleOrOpenRole(EXECUTOR_ROLE) {
        super.executeBatch(targets, values, datas, predecessor, salt);
    }
    
}