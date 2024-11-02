// SPDX-License-Identifier: MIT

pragma solidity >=0.8.9;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { EnumerableMap } from "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";
import { AggregatorV3Interface } from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract Tokens is AccessControl {
    using EnumerableMap for EnumerableMap.UintToAddressMap;

    struct AllowedToken {
        AggregatorV3Interface priceFeed;
        uint256 index;
        uint256 decimal;
        string symbol;
    }

    bytes32 private constant EDITOR_ROLE = keccak256("EDITOR_ROLE");
    mapping(address tokenAddress => AllowedToken token) public allowedTokens;
    EnumerableMap.UintToAddressMap private tokens;

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(EDITOR_ROLE, msg.sender);
    }

    error TokenValidationError(string message);

    event TokenAdded(address tokenAddress, address priceFeed, uint256 decimal, string symbol);
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
        uint256 _decimal,
        string memory _symbol
    ) external onlyRole(EDITOR_ROLE) {
        if (_tokenAddress == address(0) || _priceFeed == address(0)) {
            revert TokenValidationError("Token address cannot be zero");
        }
        if (bytes(_symbol).length == 0) {
            revert TokenValidationError("Name cannot be empty");
        }
        if (_decimal == 0) {
            revert TokenValidationError("decimal cannot be zero");
        }
        allowedTokens[_tokenAddress] = AllowedToken({
            priceFeed: AggregatorV3Interface(_priceFeed),
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
        if (_tokenAddress == address(0)) {
            revert TokenValidationError("Token address cannot be zero");
        }
        if (!_isTokenAvailable(_tokenAddress)) {
            revert TokenValidationError("Token does not exist");
        }

        uint256 index = allowedTokens[_tokenAddress].index;
        delete allowedTokens[_tokenAddress];
        tokens.remove(index);
        emit TokenRemoved(_tokenAddress);
    }

    /**
     * @notice Retrieves the list of allowed tokens
     * @return An array of token addresses
     * @return An array of AllowedToken structs
     */
    function getAllowedTokens() public view returns (address[] memory, AllowedToken[] memory) {
        AllowedToken[] memory _allowedTokens = new AllowedToken[](tokens.length());
        address[] memory _addresses = new address[](tokens.length());
        for (uint256 i = 0; i < tokens.length(); ) {
            (, address tokenAddress) = tokens.at(i);
            _allowedTokens[i] = allowedTokens[tokenAddress];
            _addresses[i] = tokenAddress;
            unchecked {
                i++;
            }
        }
        return (_addresses, _allowedTokens);
    }

    /**
     * @notice Checks if a token is available in the allowed tokens list
     * @param _tokenAddress The address of the token to check
     * @return bool True if the token is available, false otherwise
     */
    function _isTokenAvailable(address _tokenAddress) internal view returns (bool) {
        return allowedTokens[_tokenAddress].priceFeed != AggregatorV3Interface(address(0));
    }

    function _getTokenDetails(address _tokenAddress) internal view returns (AllowedToken memory) {
        return allowedTokens[_tokenAddress];
    }
}
