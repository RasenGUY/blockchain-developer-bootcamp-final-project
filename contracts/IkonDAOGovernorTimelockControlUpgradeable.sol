// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorTimelockControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/governance/TimelockControllerUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol"; 

/// @title The IkonDaoGoverorTimelockControl 
/// @author Fernando M. Trouw
/// @notice takes a dao instance and performs important dao operatios (state, execute etc. on its behalf - )
/// @notice this contract experimental 
/// @notice this contract is an experimental contract and should not be used to initiate project that will hold real value

abstract contract IkonDAOGovernorTimelockControlUpgradeable is GovernorTimelockControlUpgradeable {
        TimelockControllerUpgradeable private _timelock;
        mapping(uint256 => bytes32) private _timelockIds;
        
        /// @notice instantiates timelock controller 
        function __IkonDAOGovernorTimelockControlUpgradeable_init(TimelockControllerUpgradeable ikonDtimelockAddress) external initializer {
            __GovernorTimelockControl_init(ikonDtimelockAddress);
        }
        
        // functions that need to be overriden so solidity doesn't scream at me
        function supportsInterface(bytes4 interfaceId) public view override(GovernorTimelockControlUpgradeable) returns (bool) {
            return super.supportsInterface(interfaceId);
        }

        function state(uint256 proposalId) public view override returns (ProposalState) {
            ProposalState status = super.state(proposalId);

            if (status != ProposalState.Succeeded) {
                return status;
            }

            // core tracks execution, so we just have to check if successful proposal have been queued.
            bytes32 queueid = _timelockIds[proposalId];
            if (queueid == bytes32(0)) {
                return status;
            } else if (_timelock.isOperationDone(queueid)) {
                return ProposalState.Executed;
            } else {
                return ProposalState.Queued;
            }
        }

        function timelock() public view override returns (address) {
            return address(_timelock);
        }

        function proposalEta(uint256 proposalId) public view override returns (uint256) {
            uint256 eta = _timelock.getTimestamp(_timelockIds[proposalId]);
            return eta == 1 ? 0 : eta; // _DONE_TIMESTAMP (1) should be replaced with a 0 value
        }

        function queue(
            address[] memory targets,
            uint256[] memory values,
            bytes[] memory calldatas,
            bytes32 descriptionHash
        ) public override returns (uint256) {
            uint256 proposalId = hashProposal(targets, values, calldatas, descriptionHash);
            require(state(proposalId) == ProposalState.Succeeded, "Governor: proposal not successful");

            uint256 delay = _timelock.getMinDelay();
            _timelockIds[proposalId] = _timelock.hashOperationBatch(targets, values, calldatas, 0, descriptionHash);
            _timelock.scheduleBatch(targets, values, calldatas, 0, descriptionHash, delay);

            emit ProposalQueued(proposalId, block.timestamp + delay);

            return proposalId;
        }

        function _execute(
            uint256, /* proposalId */
            address[] memory targets,
            uint256[] memory values,
            bytes[] memory calldatas,
            bytes32 descriptionHash
        ) internal override {
            _timelock.executeBatch{value: msg.value}(targets, values, calldatas, 0, descriptionHash);
        }

        function _cancel(
            address[] memory targets,
            uint256[] memory values,
            bytes[] memory calldatas,
            bytes32 descriptionHash
        ) internal override returns (uint256) {
            uint256 proposalId = super._cancel(targets, values, calldatas, descriptionHash);
            if (_timelockIds[proposalId] != 0) {
                _timelock.cancel(_timelockIds[proposalId]);
                delete _timelockIds[proposalId];
            }

            return proposalId;
        }

        function _executor() internal view override returns (address) {
            return address(_timelock);
        }

}