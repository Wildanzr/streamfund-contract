// SPDX-License-Identifier: MIT

pragma solidity >=0.8.9;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { EnumerableMap } from "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";

contract TokenManagement is AccessControl {
    using EnumerableMap for EnumerableMap.UintToAddressMap;

    struct AllowedToken {
        address priceFeed;
        uint256 index;
        uint8 decimal;
        string symbol;
    }

    bytes32 private constant EDITOR_ROLE = keccak256("EDITOR_ROLE");
    mapping(address tokenAddress => AllowedToken token) public allowedTokens;
    EnumerableMap.UintToAddressMap private tokens;

    constructor() {
        _grantRole(EDITOR_ROLE, msg.sender);
    }

    error ValidationError(string message);

    event TokenAdded(address tokenAddress, address priceFeed, uint8 decimal, string symbol);
    event TokenRemoved(address tokenAddress);

    /**
     * @notice Adds a new token to the allowed tokens list
     * @param _tokenAddress The address of the token contract
     * @param _priceFeed The address of the price feed contract
     * @param _decimal The number of decimal the token uses
     * @param _symbol The symbol of the token
     */
    function addAllowedToken(
        address _tokenAddress,
        address _priceFeed,
        uint8 _decimal,
        string memory _symbol
    ) external onlyRole(EDITOR_ROLE) {
        if (_tokenAddress == address(0) || _priceFeed == address(0)) {
            revert ValidationError("Token address cannot be zero");
        }
        if (bytes(_symbol).length == 0) {
            revert ValidationError("Name cannot be empty");
        }
        if (_decimal == 0) {
            revert ValidationError("decimal cannot be zero");
        }
        allowedTokens[_tokenAddress] = AllowedToken({
            priceFeed: _priceFeed,
            index: tokens.length(),
            decimal: _decimal,
            symbol: _symbol
        });
        tokens.set(tokens.length(), _tokenAddress);
        emit TokenAdded(_tokenAddress, _priceFeed, _decimal, _symbol);
    }

    /**
     * @notice Removes a token from the allowed tokens list
     * @param _tokenAddress The address of the token contract to remove
     */
    function removeAllowedToken(address _tokenAddress) external onlyRole(EDITOR_ROLE) {
        if (allowedTokens[_tokenAddress].priceFeed == address(0)) {
            revert ValidationError("Token does not exist");
        }
        delete allowedTokens[_tokenAddress];
        tokens.remove(allowedTokens[_tokenAddress].index);
        emit TokenRemoved(_tokenAddress);
    }

    /**
     * @notice Retrieves the list of allowed tokens
     * @return An array of AllowedToken structs
     */
    function getAllowedTokens() public view returns (AllowedToken[] memory) {
        AllowedToken[] memory _allowedTokens = new AllowedToken[](tokens.length());
        for (uint256 i = 0; i < tokens.length(); ) {
            (, address tokenAddress) = tokens.at(i);
            _allowedTokens[i] = allowedTokens[tokenAddress];
            unchecked {
                i++;
            }
        }
        return _allowedTokens;
    }

    /**
     * @notice Checks if a token is available in the allowed tokens list
     * @param _tokenAddress The address of the token to check
     * @return bool True if the token is available, false otherwise
     */
    function _isTokenAvailable(address _tokenAddress) internal view returns (bool) {
        return allowedTokens[_tokenAddress].priceFeed != address(0);
    }
}