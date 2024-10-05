// SPDX-License-Identifier: MIT

pragma solidity >=0.8.9;

import { Tokens } from "./Tokens.sol";
import { Streamers } from "./Streamers.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { EnumerableMap } from "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";

contract Streamfund is AccessControl, Tokens, Streamers {
    bytes32 private constant EDITOR_ROLE = keccak256("EDITOR_ROLE");

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(EDITOR_ROLE, msg.sender);
    }

    error StreamfundValidationError(string message);
    event SupportReceived(address indexed streamer, address token, uint256 amount, string message);

    function supportWithETH(address _streamer, string memory _message) external payable {
        if (msg.value == 0) {
            revert StreamfundValidationError("Amount cannot be zero");
        }
        if (!_isStreamerExist(_streamer)) {
            revert StreamfundValidationError("Streamer not registered");
        }
        if (block.chainid != 84532) {
            revert StreamfundValidationError("Only base sepolia chain is supported");
        }

        payable(_streamer).transfer(msg.value);
        uint256 index = _getStreamerIndex(_streamer);
        registeredStreamer[index].cumulative[0].total += msg.value;
        emit SupportReceived(_streamer, 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE, msg.value, _message);
    }

    function supportWithToken(
        address _streamer,
        address _allowedToken,
        uint256 amount,
        string memory _message
    ) external {}
}
