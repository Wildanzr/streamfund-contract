// SPDX-License-Identifier: MIT

pragma solidity >=0.8.9;

import { Tokens } from "./Tokens.sol";
import { Videos } from "./Videos.sol";
import { Streamers } from "./Streamers.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { PriceConverter } from "./PriceConverter.sol";
import "hardhat/console.sol";

contract Streamfund is AccessControl, Tokens, Videos, Streamers {
    using SafeERC20 for IERC20;
    bytes32 private constant EDITOR_ROLE = keccak256("EDITOR_ROLE");

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(EDITOR_ROLE, msg.sender);
    }

    error StreamfundValidationError(string message);
    event SupportReceived(address indexed streamer, address from, address token, uint256 amount, string message);
    event LiveAdsReceived(address indexed streamer, address from, address token, uint256 amount, string message);
    event VideoSupportReceived(address indexed streamer, address from, bytes32 videoId, uint256 amount, string message);

    function supportWithETH(address _streamer, string memory _message) external payable {
        if (msg.value == 0) {
            revert StreamfundValidationError("Amount cannot be zero");
        }
        if (!_isStreamerExist(_streamer)) {
            revert StreamfundValidationError("Streamer not registered");
        }
        if (bytes(_message).length > 150) {
            revert StreamfundValidationError("Message too long");
        }
        // if (block.chainid != 84532) {
        //     revert StreamfundValidationError("Only base sepolia chain is supported");
        // }

        payable(_streamer).transfer(msg.value);
        _addTokenSupport(_streamer, 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE, msg.value);
        emit SupportReceived(_streamer, msg.sender, 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE, msg.value, _message);
    }

    function supportWithToken(
        address _streamer,
        address _allowedToken,
        uint256 amount,
        string memory _message
    ) external {
        if (amount == 0) {
            revert StreamfundValidationError("Amount cannot be zero");
        }
        if (!_isStreamerExist(_streamer)) {
            revert StreamfundValidationError("Streamer not registered");
        }
        if (!_isTokenAvailable(_allowedToken)) {
            revert StreamfundValidationError("Token not allowed");
        }
        if (bytes(_message).length > 150) {
            revert StreamfundValidationError("Message too long");
        }
        // if (block.chainid != 84532) {
        //     revert StreamfundValidationError("Only base sepolia chain is supported");
        // }
        uint256 allowance = IERC20(_allowedToken).allowance(msg.sender, address(this));
        if (allowance < amount) {
            revert StreamfundValidationError("Insufficient allowance");
        }

        IERC20(_allowedToken).safeTransferFrom(msg.sender, _streamer, amount);
        _addTokenSupport(_streamer, _allowedToken, amount);
        emit SupportReceived(_streamer, msg.sender, _allowedToken, amount, _message);
    }

    function supportWithVideo(
        address _streamer,
        bytes32 _videoId,
        address _allowedToken,
        uint256 _amount,
        string memory _message
    ) external {
        if (!_isStreamerExist(_streamer)) {
            revert StreamfundValidationError("Streamer not registered");
        }
        if (!_isTokenAvailable(_allowedToken)) {
            revert StreamfundValidationError("Token not allowed");
        }
        if (!_isVideoAvailable(_videoId)) {
            revert StreamfundValidationError("Video not allowed");
        }
        if (bytes(_message).length > 150) {
            revert StreamfundValidationError("Message too long");
        }
        // if (block.chainid != 84532) {
        //     revert StreamfundValidationError("Only base sepolia chain is supported");
        // }

        AllowedToken memory details = _getTokenDetails(_allowedToken);
        uint256 pfDecimal = uint256(PriceConverter.getDecimal(details.priceFeed));

        uint256 usdPrice = getVideo(_videoId) * 10 ** 18;
        uint256 tokenPrice = PriceConverter.getPrice(details.priceFeed) * 10 ** (18 - pfDecimal);
        uint256 costToSupport = (usdPrice * 10 ** 18) / tokenPrice;
        if (_amount < costToSupport) {
            revert StreamfundValidationError("Insufficient amount");
        }

        uint256 allowance = IERC20(_allowedToken).allowance(msg.sender, address(this));
        if (allowance < _amount) {
            revert StreamfundValidationError("Insufficient allowance");
        }

        IERC20(_allowedToken).safeTransferFrom(msg.sender, _streamer, _amount);
        _addTokenSupport(_streamer, _allowedToken, _amount);
        emit VideoSupportReceived(_streamer, msg.sender, _videoId, _amount, _message);
    }

    function supportWithVideoETH(address _streamer, bytes32 _videoId, string memory _message) external payable {
        if (msg.value == 0) {
            revert StreamfundValidationError("Amount cannot be zero");
        }
        if (!_isStreamerExist(_streamer)) {
            revert StreamfundValidationError("Streamer not registered");
        }
        if (!_isVideoAvailable(_videoId)) {
            revert StreamfundValidationError("Video not allowed");
        }
        if (bytes(_message).length > 150) {
            revert StreamfundValidationError("Message too long");
        }
        // if (block.chainid != 84532) {
        //     revert StreamfundValidationError("Only base sepolia chain is supported");
        // }

        uint256 usdPrice = getVideo(_videoId) * 1e18;
        uint256 tokenPrice = PriceConverter.getPrice(
            allowedTokens[0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE].priceFeed
        ) * (10 ** 10);
        uint256 amount = (usdPrice * 1e18) / tokenPrice;

        // console.log("USD Price: %s", usdPrice);
        // console.log("Token Price: %s", tokenPrice);
        // console.log("Amount: %s", amount);
        // console.log("msg.value: %s", msg.value);

        if (msg.value < amount) {
            revert StreamfundValidationError("Insufficient amount");
        }

        payable(_streamer).transfer(msg.value);
        _addTokenSupport(_streamer, 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE, amount);
        emit VideoSupportReceived(_streamer, msg.sender, _videoId, amount, _message);
    }

    function getAllowedTokenPrice(address _token) external view returns (uint256, uint8) {
        if (!_isTokenAvailable(_token)) {
            return (0, 0);
        }
        uint256 price = PriceConverter.getPrice(allowedTokens[_token].priceFeed);
        uint8 decimal = PriceConverter.getDecimal(allowedTokens[_token].priceFeed);
        return (price, decimal);
    }
}
