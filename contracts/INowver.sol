// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.7;

interface INowver {
    /// @notice BuyToken emits when a user calls the payable function Mint()
    /// @dev emits an event containing buyer address, tokenId type id and edition occurence id
    /// @param buyer address of the buyer
    /// @param tokenId uint256 id of the token type minted
    /// @param edition uint256 id of the token occurence minted
    event BuyToken(address buyer, uint256 tokenId, uint256 edition);

    /// @notice TokenData is a struct holding the configuration for a registered token
    /// @dev TokenData ensures a token cannot be minted without being registered first
    ///     and cannot be minted more than TokenData.supply is configured to
    struct TokenData {
        uint256 supply; //
        uint256 count;
    }

    /// @notice mint creates a new token of type _id, reverts if all occurences of the token are already minted
    /// @dev _id must be registered with registerToken first
    /// @param _id uint256 id of the desired token
    /// @return uint256 instance id of the token minted
    function mint(uint256 _id) external payable returns (uint256);

    /// @notice registerToken creates a new TokenData type for a given _id with a max _supply
    /// @dev _id should not already be registered, _supply must be greater than 0
    /// @param _id uint256 id of the token to register, should be incremental
    /// @param _supply uint256 max circulating supply
    function registerToken(uint256 _id, uint256 _supply) external;

    /// @notice exists verifies a token of type _id is registered
    /// @param _id uint256 id of the token to verify
    /// @return bool
    function exists(uint256 _id) external view returns (bool);
}
