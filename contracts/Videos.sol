// SPDX-License-Identifier: MIT

pragma solidity >=0.8.9;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { EnumerableMap } from "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";

contract Videos {
    bytes32 private constant CHARACTERS = "abcdefghijklmnopqrstuvwxyzABCDEF";
    uint256 private constant CHARACTERS_LENGTH = 32;

    struct Video {
        string id;
        uint8 price;
    }

    bytes32 private constant EDITOR_ROLE = keccak256("EDITOR_ROLE");

    event VideoAdded(string id, string link, string thumbnail);
    event VideoRemoved(string id);

    // Generates a pseudo-random bytes32 hash using block properties.
    function _generateRandomBytes32() private view returns (bytes32) {
        return keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender));
    }

    // Converts bytes32 to a random string of given length.
    function generateRandomString(uint256 length) public view returns (string memory) {
        require(length > 0, "Length must be greater than 0");

        bytes32 randomBytes = _generateRandomBytes32();
        bytes memory result = new bytes(length);

        for (uint256 i = 0; i < length; i++) {
            // Use modulo to ensure index stays within the CHARACTERS range
            uint256 randomIndex = uint8(randomBytes[i % 32]) % CHARACTERS_LENGTH;
            result[i] = CHARACTERS[randomIndex];
        }

        return string(result);
    }
}
