// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./Constants.sol";

/// @custom:security-contact ftrouw@protonmail.com
contract IkonDAOVectorCollectible is ERC721, ERC721Enumerable, ERC721URIStorage, Pausable, AccessControl, Constants {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    mapping(uint256 => bytes32) private _categories; 
    mapping(bytes32 => bool) private _isCategory;
    address private _DAO; 

    event DaoAddressChanged(address newAddress);
    event VectorMinted(uint256 tokenId, bytes32 Category);

    constructor(address DAO) ERC721("IkonDAO Vector Collectible", "IKDVC") {
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(PAUSER_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
        _DAO = DAO;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://localhost:3005/api/vectors/";
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function safeMint(address _to) private {
        _safeMint(_to, _tokenIdCounter.current());
        _tokenIdCounter.increment();
    }

    /// @dev mints vector token for the icon dao
    /// @param category category under which the vector falls      
    function safeMintVector(bytes32 category) external onlyRole(MINTER_ROLE) returns (string memory) {
        _categories[_tokenIdCounter.current()] = category;
        safeMint(_DAO);
        emit VectorMinted(_tokenIdCounter.current() - 1, category);
        return tokenURI(_tokenIdCounter.current() - 1);     
    }
    
    /// @dev returns dao address 
    function getDaoAddress() public view returns (address){
        return _DAO;
    }

    /// @dev see _setDaoAddress
    function setDaoAddress(address newAddress) external {
        _setDaoAddress(newAddress);
        emit DaoAddressChanged(newAddress);
    }

    /// @dev sets new dao address (address to which vectors will belong)
    /// @param _new is the new address that will own the vectors
    function _setDaoAddress(address _new) private {
        _DAO = _new;
    }
    
    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        whenNotPaused
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    // The following functions are overrides required by Solidity.
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
