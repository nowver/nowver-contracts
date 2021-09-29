//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./utils/NowverUtils.sol";
import "./INowver.sol";

contract Nowver is ERC1155, ERC1155Burnable, NowverUtils, INowver {
    using Strings for uint256;

    /// @notice metadataBaseURI holds the URI pointing to the contracts metadata
    /// @dev ipfs hash or api uri
    /// @return metadataBaseURI link
    string public metadataBaseURI;

    /// @notice tokens holds the configuration of all tokens
    /// @dev mapping of id to TokenData structs, token is not registered if TokenData.supply is set to 0
    mapping(uint256 => TokenData) public tokens;

    /// @notice tokensCount is a counter of registered tokens
    /// @dev used to track the number of tokens created without looping over the tokens mapping
    /// @return tokensCount uin256
    uint256 public tokensCount = 0;

    constructor(string memory _metadataUri) ERC1155(_metadataUri) {
        // Setting the default metadataBaseUri happens in the ERC1155 contract constructor
    }

    /// @notice supportsInterface is the ERC165 compliant method indicating this contract supports an ERC1155 interface
    /// @dev this methods takes a bytes
    /// @param interfaceId bytes4 value of the interface to check
    /// @return Documents the return variables of a contract’s function state variable
    function supportsInterface(bytes4 interfaceId) public view override(ERC1155) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /// @notice A distinct Uniform Resource Identifier (URI) for a given token.
    /// @dev URIs are defined in RFC 3986.
    ///     URIs are assumed to be deterministically generated based on token ID
    /// @return URI string
    function uri(uint256 _id) public view override returns (string memory) {
        return string(abi.encodePacked(metadataBaseURI, _id.toString(), ".json"));
    }

    /// @notice setUri replaces _uri with newUri
    /// @param _metadataBaseURI string ipfs hash
    function setURI(string memory _metadataBaseURI) public onlyOwner {
        _setURI(_metadataBaseURI);
    }

    /// @notice _setUri internal method called by setUri and constructor
    /// @param _metadataBaseURI string ipfs hash
    function _setURI(string memory _metadataBaseURI) internal override {
        metadataBaseURI = _metadataBaseURI;
    }

    /// @notice mint creates a new token of type _id, reverts if all occurences of the token are already minted
    /// @dev _id must be registered with registerToken first
    /// @param _id uint256 id of the desired token
    /// @return uint256 instance id of the token minted
    function mint(uint256 _id) public payable override returns (uint256) {
        require(exists(_id), "Nowver: token doesn't exist");
        require(msg.value == tokens[_id].price, "Nowver: incorrect price");
        require(tokens[_id].count + 1 <= tokens[_id].supply, "Nowver: out of bonds");

        tokens[_id].count += 1;
        uint256 edition = tokens[_id].count;

        _mint(_msgSender(), _id, 1, "");
        return edition;
    }

    /// @notice registerToken creates a new TokenData type for a given _id with
    ///         a max _supply
    /// @dev _id should not already be registered,
    ///         _supply must be greater than 0,
    ///         _id should be equal to (tokensCount + 1)
    /// @param _id uint256 id of the token to register, should be incremental
    /// @param _supply uint256 max circulating supply
    /// @param _price uint256 price of the token
    function registerToken(
        uint256 _id,
        uint256 _supply,
        uint256 _price
    ) public override onlyOwner {
        require(tokens[_id].supply == 0, "Nowver: token already registered");
        require(_supply > 0, "Nowver: supply must be greater than 0");
        tokens[_id].supply = _supply;
        tokens[_id].price = _price;
        tokensCount += 1;
    }

    /// @notice withdraw sends the contract balance to the contract owner
    function withdraw() public {
        // get the amount stored in this contract
        uint256 amount = address(this).balance;
        address payable contractOwner = payable(owner());

        // send the balance to contract owner
        // Owner can receive Ether since the address of owner is payable
        (bool success, ) = contractOwner.call{value: amount}("");
        require(success, "Nowver: failed to withdraw");
    }

    /// @notice exists verifies a token of type _id is registered
    /// @param _id uint256 id of the token to verify
    /// @return bool
    function exists(uint256 _id) public view override returns (bool) {
        return tokens[_id].supply != 0;
    }

    /// @dev Hook that is called before any token transfer. This includes
    // minting and burning, as well as batched variants, overriden with
    /// whenNotPaused modifier
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override whenNotPaused {}

    /// @notice burn sends a token to address 0x0 so that no one can ever access it
    /// @dev can only be called when contract is not paused
    /// @param account address of the user owning the token
    /// @param id uint256 id of the token to burn
    /// @param value quantity of tokens to burn
    function burn(
        address account,
        uint256 id,
        uint256 value
    ) public override whenNotPaused {
        require(
            account == _msgSender() || isApprovedForAll(account, _msgSender()),
            "ERC1155: caller is not owner nor approved"
        );

        _burn(account, id, value);
    }

    /// @notice burnBatch sends multiple tokens to address 0x0 so that no one can ever access it
    /// @dev can only be called when contract is not paused
    /// @param account address of the user owning the token
    /// @param ids uint256[] ids of the tokens to burn
    /// @param values uint256[] quantity of tokens to burn
    function burnBatch(
        address account,
        uint256[] memory ids,
        uint256[] memory values
    ) public override whenNotPaused {
        require(
            account == _msgSender() || isApprovedForAll(account, _msgSender()),
            "ERC1155: caller is not owner nor approved"
        );

        _burnBatch(account, ids, values);
    }
}
