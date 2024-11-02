// SPDX-License-Identifier: MIT

pragma solidity >=0.8.9;

import { EnumerableMap } from "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";

contract Streamers {
    using EnumerableMap for EnumerableMap.AddressToUintMap;

    struct TokenSupport {
        address token;
        uint256 total;
    }

    struct Streamer {
        uint8 liveAdsPrice;
        address streamer;
        TokenSupport[] cumulative;
    }

    uint256 public streamerCount;
    Streamer[] internal registeredStreamer;
    EnumerableMap.AddressToUintMap private streamers;

    error StreamerValidationError(string message);
    event StreamerRegistered(address streamer);
    event StreamerUpdated(address streamer, uint8 liveAdsPrice);

    /**
     * @notice Registers the caller as a streamer.
     * @dev Adds the caller to the list of streamers and initializes their token support.
     * @dev Emits a {StreamerRegistered} event.
     * @dev Reverts with {StreamerValidationError} if the caller is already registered.
     */
    function registerAsStreamer() public {
        if (streamers.contains(msg.sender)) {
            revert StreamerValidationError("Streamer already registered.");
        }
        streamers.set(msg.sender, streamers.length());
        streamerCount++;
        registeredStreamer.push();
        Streamer storage newStreamer = registeredStreamer[registeredStreamer.length - 1];
        newStreamer.streamer = msg.sender;
        _addTokenSupport(msg.sender, 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE, 0);
        emit StreamerRegistered(msg.sender);
    }

    /**
     * @notice Updates the live ads price for the caller.
     * @dev Updates the live ads price for the caller if they are registered as a streamer.
     * @dev Emits a {StreamerUpdated} event.
     * @dev Reverts with {StreamerValidationError} if the caller is not registered.
     * @param _price The new live ads price.
     */
    function updateLiveAdsPrice(uint8 _price) public {
        if (!_isStreamerExist(msg.sender)) {
            revert StreamerValidationError("Streamer not registered.");
        }

        uint256 index = _getStreamerIndex(msg.sender);
        registeredStreamer[index].liveAdsPrice = _price;
        emit StreamerUpdated(msg.sender, _price);
    }

    /**
     * @notice Gets the details of a streamer.
     * @param _streamer The address of the streamer.
     * @return The index of the streamer and an array of TokenSupport.
     */
    function getStreamerDetails(address _streamer) public view returns (uint256, uint8, TokenSupport[] memory) {
        if (!_isStreamerExist(_streamer)) {
            return (0, 0, new TokenSupport[](0));
        }
        uint256 index = _getStreamerIndex(_streamer);
        Streamer memory streamerDetails = registeredStreamer[index];
        return (index, streamerDetails.liveAdsPrice, streamerDetails.cumulative);
    }

    /**
     * @notice Adds token support for a streamer.
     * @dev Updates the total amount of a token supported by a streamer or adds a new token support entry.
     * @param _streamer The address of the streamer.
     * @param _token The address of the token.
     * @param _amount The amount of the token to add to the support.
     */
    function _addTokenSupport(address _streamer, address _token, uint256 _amount) internal {
        uint256 index = _getStreamerIndex(_streamer);
        for (uint256 i = 0; i < registeredStreamer[index].cumulative.length; ) {
            if (registeredStreamer[index].cumulative[i].token == _token) {
                registeredStreamer[index].cumulative[i].total += _amount;
                return;
            }
            unchecked {
                i++;
            }
        }
        TokenSupport memory newToken = TokenSupport({ token: _token, total: _amount });
        registeredStreamer[index].cumulative.push(newToken);
    }

    /**
     * @notice Checks if a streamer exists.
     * @param _streamer The address of the streamer.
     * @return True if the streamer exists, false otherwise.
     * @dev Uses the EnumerableMap to check if the streamer exists.
     */
    function _isStreamerExist(address _streamer) internal view returns (bool) {
        return streamers.contains(_streamer);
    }

    /**
     * @notice Gets the index of a streamer.
     * @param _streamer The address of the streamer.
     * @return The index of the streamer.
     * @dev Uses the EnumerableMap to get the index of the streamer.
     */
    function _getStreamerIndex(address _streamer) internal view returns (uint256) {
        return streamers.get(_streamer);
    }
}
