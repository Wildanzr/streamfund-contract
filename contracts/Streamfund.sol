// SPDX-License-Identifier: MIT

pragma solidity >=0.8.9;

import { EnumerableMap } from "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";

contract Streamfund {
    using EnumerableMap for EnumerableMap.AddressToUintMap;

    EnumerableMap.AddressToUintMap private allowedTokens;

    event AllowedTokenSet(address indexed token, uint256 amount);
    event AllowedTokenRemoved(address indexed token);
    event AllowedTokenChecked(address indexed token, bool exists);
    event AllowedTokenLengthChecked(uint256 length);
    event AllowedTokenTryGet(address indexed token, bool success, uint256 amount);

    function setAllowedToken(address token, uint256 amount) public {
        allowedTokens.set(token, amount);
        emit AllowedTokenSet(token, amount);
    }

    function removeAllowedToken(address token) public {
        allowedTokens.remove(token);
        emit AllowedTokenRemoved(token);
    }

    function containsAllowedToken(address token) public view returns (bool) {
        bool exists = allowedTokens.contains(token);
        emit AllowedTokenChecked(token, exists);
        return exists;
    }

    function getAllowedTokenLength() public view returns (uint256) {
        uint256 length = allowedTokens.length();
        emit AllowedTokenLengthChecked(length);
        return length;
    }

    function tryGetAllowedToken(address token) public view returns (bool, uint256) {
        (bool success, uint256 amount) = allowedTokens.tryGet(token);
        emit AllowedTokenTryGet(token, success, amount);
        return (success, amount);
    }
}
