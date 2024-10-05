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
            revert StreamerValidationError("Streamer already registered");
        }
        streamers.set(msg.sender, streamers.length());
        TokenSupport memory nativeToken = TokenSupport({ token: 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE, total: 0 });
        Streamer storage newStreamer = registeredStreamer.push();
        newStreamer.streamer = msg.sender;
        newStreamer.cumulative.push(nativeToken);
        streamerCount++;
        emit StreamerRegistered(msg.sender);
    }

    function _isStreamerExist(address _streamer) internal view returns (bool) {
        return streamers.contains(_streamer);
    }

    function _getStreamerIndex(address _streamer) internal view returns (uint256) {
        return streamers.get(_streamer);
    }
}
