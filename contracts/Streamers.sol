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
        address streamer;
        TokenSupport[] cumulative;
    }

    uint256 public streamerCount;
    Streamer[] internal registeredStreamer;
    EnumerableMap.AddressToUintMap private streamers;

    error StreamerValidationError(string message);
    event StreamerRegistered(address streamer);

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

    function getStreamerDetails(address _streamer) public view returns (uint256, TokenSupport[] memory) {
        if (!_isStreamerExist(_streamer)) {
            return (0, new TokenSupport[](0));
        }
        uint256 index = _getStreamerIndex(_streamer);
        Streamer memory streamerDetails = registeredStreamer[index];
        return (index, streamerDetails.cumulative);
    }

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

    function _isStreamerExist(address _streamer) internal view returns (bool) {
        return streamers.contains(_streamer);
    }

    function _getStreamerIndex(address _streamer) internal view returns (uint256) {
        return streamers.get(_streamer);
    }
}
