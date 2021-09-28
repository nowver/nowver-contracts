//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "./utils/NowverUtils.sol";
import "./INowver.sol";


contract Nowver is ERC1155, ERC1155Burnable, NowverUtils, INowver {
    
    /// @notice metadataBaseURI holds the URI pointing to the contracts metadata
    /// @dev ipfs hash or api uri
    /// @return metadataBaseURI link
    string public metadataBaseURI;
    
    // tokens mapping of tokenId with TokenData item
    /// @notice tokens holds the configuration of all tokens
    /// @dev mapping of id to TokenData structs, token is not registered if TokenData.supply is set to 0
    mapping(uint256 => TokenData) public tokens;
    
    constructor(string memory _metadataUri) ERC1155("") {
        // Setting the default metadataBaseUri
        setUri(_metadataUri);
    }

    /// @notice supportsInterface is the ERC165 compliant method indicating this contract supports an ERC1155 interface
    /// @dev this methods takes a bytes
    /// @param interfaceId bytes4 value of the interface to check
    /// @return Documents the return variables of a contract’s function state variable
    function supportsInterface(bytes4 interfaceId) public view override(ERC1155) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @notice A distinct Uniform Resource Identifier (URI) for a given token.
     * @dev URIs are defined in RFC 3986.
     *      URIs are assumed to be deterministically generated based on token ID
     * @return URI string
     */
    function uri(uint256 _id) public view override returns (string memory) {
        return string(abi.encodePacked(metadataBaseURI, _uint2str(_id), ".json"));
    }

    /// @notice setUri replaces _uri with newUri
    /// @param _metadataBaseURI string ipfs hash pointing to the NFT metadatas
    function setUri(string memory _metadataBaseURI) public onlyOwner {
        metadataBaseURI = _metadataBaseURI;
    }

    /// @notice mint creates a new token of type _id, reverts if all occurences of the token are already minted
    /// @dev _id must be registered with registerToken first
    /// @param _id uint256 id of the desired token
    /// @return uint256 instance id of the token minted
    function mint(uint256 _id) public override payable returns (uint256) {
        require(exists(_id), "token doesn't exist");
        tokens[_id].count += 1;
        uint256 instance = tokens[_id].count;
        require(instance <= tokens[_id].supply, "out of bonds");
        _mint(_msgSender(), _id, 1, "");
        return instance;
    }

    /// @notice registerToken creates a new TokenData type for a given _id with a max _supply
    /// @dev _id should not already be registered, _supply must be greater than 0
    /// @param _id uint256 id of the token to register, should be incremental
    /// @param _supply uint256 max circulating supply
    function registerToken(uint256 _id, uint256 _supply) public onlyOwner {
        require(tokens[_id].supply == 0, "token already registered");
        require(_supply > 0, "supply must be greater than 0");
        tokens[_id].supply = _supply;
    }

    /// @notice exists verifies a token of type _id is registered
    /// @param _id uint256 id of the token to verify
    /// @return bool
    function exists(uint256 _id) public view returns (bool) {
        return tokens[_id].supply != 0;
    }

    uint256[47] private __gap;
}
