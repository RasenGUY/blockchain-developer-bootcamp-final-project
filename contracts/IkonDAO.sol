// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

/// @title The IKONDAO - a distributed collective for icon, vector graphics, animated svg's creators and creative artists
/// @author Fernando M. Trouw
/// @notice this contract experimental 
/// @notice this contract is an experimental contract and should not be used to initiate project that will hold real value

import "@openzeppelin/contracts/governance/IGovernor.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol"; 
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/governance/TimelockController.sol";

import "./IkonDAOGovernor.sol";
import "./IkonDAOGovernanceToken.sol";
import "./IkonDAOToken.sol";
import "./Constants.sol";
// import "./Helpers.sol"; 

contract IkonDAO is Constants, OwnableUpgradeable, AccessControlEnumerableUpgradeable, UUPSUpgradeable {
    
    IkonDAOGovernor private _governor;
    IkonDAOToken private _daoToken; 
    IkonDAOGovernanceToken private _govToken;
    TimelockController private _daoTimelock;    
 
    mapping(uint256 => Proposal) public proposals;
    mapping(address => uint256[]) private memberProposals;

    event MemberCreated(address indexed _member); 
    event MemberBanned(address indexed _member); 

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
        __AccessControlEnumerable_init();
        __Ownable_init();
    }

    /// @dev returns governor version
    function getGovernorVersion() public view returns (string memory) {
        return _governor._version(); 
    }

    /// @dev creates a proposal to set votingDelay
    function setVotingPeriod(
        address[] calldata _targets, 
        uint256[] calldata _values, 
        bytes[] memory _calldatas
    ) external {
        
        uint256 _proposalId = _governor.propose(_targets, _values, _calldatas, DESC_SET_DELAY);
        
        Proposal memory proposal = Proposal({
            id: _proposalId,
            proposer: _msgSender(),
            state: _governor.state(_proposalId)
        });

        proposals[_proposalId] = proposal;
        memberProposals[_msgSender()].push(_proposalId); 
    }

    /// @dev get latest proposal
    function getLatestProposal(address _sender) public view returns (uint256){       
        return memberProposals[_sender][memberProposals[_sender].length - 1];
    }
    
    /// @dev creates member
    function createMember(address _applicant) external {
        require(!hasRole(MEMBER_ROLE, _applicant), REQUIRE_CREATEMEMBER_ALREADY_CREATED);
        require(!hasRole(BANNED_ROLE, _applicant), REQUIRE_CREATEMEMBER_USER_BANNED);
        grantRole(MEMBER_ROLE, _applicant);
        emit MemberCreated(_applicant);
    }

    /// @dev bans member
    function banMember(address _account) external {
        require(!hasRole(BANNED_ROLE, _account), REQUIRE_BANMEMBER_ALREADY_BANNED);
        require(hasRole(MEMBER_ROLE, _account), REQUIRE_BANMEMBER_ONLY_MEMBERS);
        revokeRole(MEMBER_ROLE, _account);
        emit MemberBanned(_account);
    } 

    /// @dev distribute votes
    /// @dev slash votes
    /// @dev distribute tokens
    /// @dev mintNft 

    /// @notice upgrades to this contract
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(ADMIN_ROLE){}
}