// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

/// @title The IKONDAO - a distributed collective for icon, vector graphics, animated svg's creators and creative artists
/// @author Fernando M. Trouw
/// @notice this contract experimental 
/// @notice this contract is an experimental contract and should not be used to initiate project that will hold real value

import "@openzeppelin/contracts-upgradeable/governance/GovernorUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorCountingSimpleUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorVotesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorVotesQuorumFractionUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/governance/TimelockControllerUpgradeable.sol";

import "./IkonDAOGovernance.sol";
import "./IkonDAOToken.sol";
import "./IkonDAOGovernorTimelockControlUpgradeable.sol";

/// @custom:security-contact ftrouw@protonmail.com
contract IkonDAO is 
Initializable, 
GovernorUpgradeable, 
GovernorCountingSimpleUpgradeable, 
GovernorVotesUpgradeable, 
IkonDAOGovernorTimelockControlUpgradeable,
GovernorVotesQuorumFractionUpgradeable, 
OwnableUpgradeable, 
UUPSUpgradeable, 
AccessControlEnumerableUpgradeable {
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {} 
    
    bytes32 public constant IKONDAO_MEMBER_ROLE = keccak256("IKONDAO_MEMBER_ROLE"); 
    bytes32 public constant IKONDAO_ADMIN_ROLE = keccak256('IKONDAO_ADMIN_ROLE');

    IkonDAOGovernance private IKDG;
    IkonDAOToken private IKDT;
    TimelockControllerUpgradeable private _daoTimelock;

    event MemberCreated(address _applicant);
    event MemberRemoved(address _member);

    /// @notice create new dao members 
    /// @param _applicant is the address of the wallet that is appplying to become a member
    /// @dev anyone can become a member, however they will incur their own gas costs
    function createMember(address _applicant) external {
        grantRole(IKONDAO_MEMBER_ROLE, _applicant); 
        _daoTimelock.grantRole(keccak256("PROPOSER_ROLE"), _applicant);
        emit MemberCreated(_applicant);
    }

    /// @notice remove new dao members, members have to vote on role revokes
    /// @dev removes member role from target only the timelock -> which will be the owner of the poxy can revoke roles
    /// @param target target of whose role will be revoked
    function removeMember(address target) external onlyRole(IKONDAO_ADMIN_ROLE) onlyOwner {
        revokeRole(IKONDAO_MEMBER_ROLE, target);
        _daoTimelock.revokeRole(keccak256("PROPOSER_ROLE"), target);
        emit MemberRemoved(target);
    }

    function initialize(ERC20VotesUpgradeable _govToken, TimelockControllerUpgradeable _daoTimelockAddress, ERC20Upgradeable _token, address _proxy)
        initializer public
    {    
        /// @notice initialize IkonDAOTimelock
        _daoTimelock = _daoTimelockAddress;
        address[] memory proposers;
        address[] memory executors; 
        proposers[0] =_proxy;
        (executors[0], executors[1]) = (_proxy, msg.sender);
        _daoTimelock.__TimelockController_init(2, proposers, executors);

        __Governor_init("IkonDAO");
        __GovernorCountingSimple_init();
        __GovernorVotes_init(_govToken); 
        __GovernorVotesQuorumFraction_init(4);
        __Ownable_init();
        __UUPSUpgradeable_init(); 
        __AccessControlEnumerable_init();
        
        __IkonDAOGovernorTimelockControlUpgradeable_init(_daoTimelockAddress);
        IKDG = IkonDAOGovernance(_govToken);
        IKDT = IkonDAOToken(_token);
        
        
        // transferOwnership(address(_timelock));
        _setRoleAdmin(IKONDAO_MEMBER_ROLE, IKONDAO_ADMIN_ROLE);             
        _setupRole(IKONDAO_ADMIN_ROLE, _msgSender());
        _setupRole(IKONDAO_ADMIN_ROLE, address(this));
    }

    function votingDelay() public pure override returns (uint256) {
        return 1; // 1 block
    }

    function votingPeriod() public pure override returns (uint256) {
        return 19636; // 3 days
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {}

    // The following functions are overrides required by Solidity.
    function quorum(uint256 blockNumber)
        public
        view
        override(IGovernorUpgradeable, GovernorVotesQuorumFractionUpgradeable)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    function getVotes(address account, uint256 blockNumber)
        public
        view
        override(IGovernorUpgradeable, GovernorVotesUpgradeable)
        returns (uint256)
    {
        return super.getVotes(account, blockNumber);
    }

    function supportsInterface(bytes4 interfaceId) public view override(AccessControlEnumerableUpgradeable, GovernorUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
