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
import "@openzeppelin/contracts-upgradeable/token/ERC721/utils/ERC721HolderUpgradeable.sol";

import "./IkonDAOGovernor.sol";
import "./IkonDAOGovernanceToken.sol";
import "./IkonDAOToken.sol";
import "./Constants.sol";
import "./IIkonDAO.sol";

// import "./Helpers.sol"; 

contract IkonDAO is Constants, OwnableUpgradeable, AccessControlEnumerableUpgradeable, ERC721HolderUpgradeable, UUPSUpgradeable {
    
    IIkonDAO private governor;
    IIkonDAO private timelocker;    
    // IIkonDAO private token; 
    // IIkonDAO private votes;
    // mapping(uint256 => Proposal) public proposals;
    // mapping(address => uint256[]) private memberProposals;
    // mapping(Avatar => IIkonDAO) private avatar;  

    event MemberCreated(address indexed _member); 
    event MemberBanned(address indexed _member); 

    /// @notice unsafe allow     
    constructor (){} 

    /// @notice initializes ikonDAO
    function __IkonDAO_init(address govAddress, address timelockerAddress) external initializer(){

        /// @notice instantiate dao interface
        governor = IIkonDAO(govAddress);
        timelocker = IIkonDAO(payable(timelockerAddress));
        // votes = IIkonDAO(govTokenAddress);
        // token = IIkonDAO(daoToken);
                
        /// @notice setRoles
        _setupRole(ADMIN_ROLE, _msgSender());
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setRoleAdmin(MEMBER_ROLE, ADMIN_ROLE);
        __AccessControlEnumerable_init();
        __Ownable_init();
        
        __ERC721Holder_init(); // give nft holding capacity of erc721 token
    }

    /// @dev creates new dao proposal
    /// @param targets contract from calldatas should be executed
    /// @param values values thaat will be sent to the targets
    /// @param datas datas that will be called by the targets
    /// @param description description of the proposal
    function propose (
        address[] calldata targets, 
        uint256[] calldata values, 
        bytes[] memory datas,
        string calldata description
    ) public onlyRole(MEMBER_ROLE) {
        governor.propose(targets, values, datas, description);
    }
    
    function execute(
        address[] calldata targets, 
        uint256[] calldata values, 
        bytes[] memory datas,
        bytes32 descriptionHash
    ) public onlyRole(MEMBER_ROLE) {
        governor.execute(targets, values, datas, descriptionHash);
    }

    function queue(
        address[] calldata targets, 
        uint256[] calldata values, 
        bytes[] memory datas,
        bytes32 descriptionHash
    ) public onlyRole(MEMBER_ROLE) {
        governor.queue(targets, values, datas, descriptionHash);
    }

    /// @dev makes a member of the caller of this function
    function createMember() external {
        require(!hasRole(MEMBER_ROLE, _msgSender()), REQUIRE_CREATEMEMBER_ALREADY_CREATED);
        require(!hasRole(BANNED_ROLE, _msgSender()), REQUIRE_CREATEMEMBER_USER_BANNED);
        grantRole(MEMBER_ROLE, _msgSender());
        emit MemberCreated(_msgSender());
    }
   
    /// @dev bans member
    /// @param _account target account to be banned
    function banMember(address _account) external onlyRole(ADMIN_ROLE) {
        require(!hasRole(BANNED_ROLE, _account), REQUIRE_BANMEMBER_ALREADY_BANNED);
        require(hasRole(MEMBER_ROLE, _account), REQUIRE_BANMEMBER_ONLY_MEMBERS);
        revokeRole(MEMBER_ROLE, _account);
        emit MemberBanned(_account);
    } 

    /// @notice upgrades to this contract
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(ADMIN_ROLE){}
}