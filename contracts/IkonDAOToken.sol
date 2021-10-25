// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

/// @title The IkonDAO Token - fungible token that powers the IkonDAO ecosystem 
/// @author Fernando M. Trouw
/// @notice this contract should be used for basic simulation purposes only 
/// @notice this contract is an experimental contract and should not be used to initiate project that will hold real value
/// @dev functions currently implemented (other then imported library) functions could contain side-effects

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

/// @custom:security-contact ftrouw@protonmail.com
contract IkonDAOToken is ERC20, ERC20Burnable, ERC20Snapshot, AccessControl, ERC20Permit {
    bytes32 public constant SNAPSHOT_ROLE = keccak256("SNAPSHOT_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor() ERC20("IkonDAO Token", "IKD") ERC20Permit("IkonDAO Token") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(SNAPSHOT_ROLE, msg.sender);
        _mint(msg.sender, 1000000 * 10 ** decimals());
        _setupRole(MINTER_ROLE, msg.sender);
    }

    function snapshot() public onlyRole(SNAPSHOT_ROLE) {
        _snapshot();
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    // The following functions are overrides required by Solidity.
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Snapshot)
    {
        super._beforeTokenTransfer(from, to, amount);
    }
}