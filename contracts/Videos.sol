// SPDX-License-Identifier: MIT

pragma solidity >=0.8.9;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { EnumerableMap } from "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";

contract Videos is AccessControl {
    using EnumerableMap for EnumerableMap.Bytes32ToUintMap;

    bytes32 private constant EDITOR_ROLE = keccak256("EDITOR_ROLE");
    mapping(bytes32 id => uint256 price) public allowedVideos;
    EnumerableMap.Bytes32ToUintMap private videos;

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(EDITOR_ROLE, msg.sender);
    }

    event VideoAdded(bytes32 id, string link, string thumbnail, uint256 price);
    event VideoRemoved(bytes32 id);
    error VideoValidationError(string message);

    /**
     * @notice Adds a new video.
     * @param _link The link to the video.
     * @param _thumbnail The thumbnail of the video.
     * @param _price The price of the video.
     * @dev Only callable by accounts with the EDITOR_ROLE.
     */
    function addVideo(string memory _link, string memory _thumbnail, uint256 _price) external onlyRole(EDITOR_ROLE) {
        bytes32 id = _generateRandomBytes32();
        if (bytes(_link).length == 0) {
            revert VideoValidationError("Link cannot be empty");
        }
        if (bytes(_thumbnail).length == 0) {
            revert VideoValidationError("Thumbnail cannot be empty");
        }
        if (_price == 0) {
            revert VideoValidationError("Price cannot be zero");
        }
        allowedVideos[id] = _price;
        videos.set(id, _price);
        emit VideoAdded(id, _link, _thumbnail, _price);
    }

    function removeVideo(bytes32 id) external onlyRole(EDITOR_ROLE) {
        if (allowedVideos[id] == 0) {
            revert VideoValidationError("Video does not exist");
        }

        allowedVideos[id] = 0;
        videos.remove(id);
        emit VideoRemoved(id);
    }

    /**
     * @notice Retrieves the price of a video.
     * @param id The ID of the video.
     * @return price The price of the video.
     */
    function getVideo(bytes32 id) external view returns (uint256 price) {
        return allowedVideos[id];
    }

    /**
     * @notice Generates a random bytes32 value.
     * @dev This function is sufficient for generating a random string for video IDs, not for lotteries or high-stakes randomness.
     * @return A random bytes32 value.
     */
    function _generateRandomBytes32() private view returns (bytes32) {
        return keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender));
    }
}
