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
    event VideoSupportReceived(
        address indexed streamer,
        address from,
        bytes32 videoId,
        address token,
        uint256 amount,
        string message
    );

    /**
     * @notice Support a streamer with ETH.
     * @param _streamer The address of the streamer to support.
     * @param _message A message to send along with the support.
     * @dev The message length must be less than or equal to 150 bytes.
     * @dev The amount of ETH sent must be greater than zero.
     * @dev The streamer must be registered.
     * @dev Emits a {SupportReceived} event.
     * @custom:error StreamfundValidationError if the amount is zero, the streamer
     * is not registered, or the message is too long.
     */
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
        // if (block.chainid != 11155111) {
        //     revert StreamfundValidationError("Only base sepolia chain is supported");
        // }

        payable(_streamer).transfer(msg.value);
        _addTokenSupport(_streamer, 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE, msg.value);
        emit SupportReceived(_streamer, msg.sender, 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE, msg.value, _message);
    }

    /**
     * @notice Support a streamer with a specific ERC20 token.
     * @param _streamer The address of the streamer to support.
     * @param _allowedToken The address of the ERC20 token to use for support.
     * @param _amount The amount of tokens to send.
     * @param _message A message to send along with the support.
     * @dev The message length must be less than or equal to 150 bytes.
     * @dev The amount of tokens sent must be greater than zero.
     * @dev The streamer must be registered.
     * @dev The token must be allowed.
     * @dev Emits a {SupportReceived} event.
     * @custom:error StreamfundValidationError if the amount is zero, the streamer
     * is not registered, the token is not allowed, the message is too long, or the allowance is insufficient.
     */
    function supportWithToken(
        address _streamer,
        address _allowedToken,
        uint256 _amount,
        string memory _message
    ) external {
        if (_amount == 0) {
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
        // if (block.chainid != 11155111) {
        //     revert StreamfundValidationError("Only base sepolia chain is supported");
        // }
        uint256 allowance = IERC20(_allowedToken).allowance(msg.sender, address(this));
        if (allowance < _amount) {
            revert StreamfundValidationError("Insufficient allowance");
        }

        IERC20(_allowedToken).safeTransferFrom(msg.sender, _streamer, _amount);
        _addTokenSupport(_streamer, _allowedToken, _amount);
        emit SupportReceived(_streamer, msg.sender, _allowedToken, _amount, _message);
    }

    /**
     * @notice Support a streamer with a specific video using ETH.
     * @param _streamer The address of the streamer to support.
     * @param _videoId The ID of the video to support.
     * @param _message A message to send along with the support.
     * @dev The message length must be less than or equal to 150 bytes.
     * @dev The amount of ETH sent must be greater than or equal to the cost to support the video.
     * @dev The streamer and video must be registered.
     * @dev Emits a {VideoSupportReceived} event.
     * @custom:error StreamfundValidationError if the amount is insufficient, the streamer
     * or video is not registered, or the message is too long.
     */
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
        // if (block.chainid != 11155111) {
        //     revert StreamfundValidationError("Only base sepolia chain is supported");
        // }

        AllowedToken memory details = _getTokenDetails(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);
        uint256 pfDecimal = uint256(PriceConverter.getDecimal(details.priceFeed));
        uint256 usdPrice = getVideo(_videoId) * 10 ** 18;
        uint256 tokenPrice = PriceConverter.getPrice(details.priceFeed) * 10 ** (18 - pfDecimal);
        uint256 costToSupport = (usdPrice * 10 ** 18) / tokenPrice;
        if (msg.value < costToSupport) {
            revert StreamfundValidationError("Insufficient amount");
        }

        payable(_streamer).transfer(msg.value);
        _addTokenSupport(_streamer, 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE, msg.value);
        emit VideoSupportReceived(
            _streamer,
            msg.sender,
            _videoId,
            0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE,
            msg.value,
            _message
        );
    }

    /**
     * @notice Support a streamer with a specific video using a specific ERC20 token.
     * @param _streamer The address of the streamer to support.
     * @param _videoId The ID of the video to support.
     * @param _allowedToken The address of the ERC20 token to use for support.
     * @param _amount The amount of tokens to send.
     * @param _message A message to send along with the support.
     * @dev The message length must be less than or equal to 150 bytes.
     * @dev The amount of tokens sent must be greater than or equal to the cost to support the video.
     * @dev The streamer and video must be registered, and the token must be allowed.
     * @dev Emits a {VideoSupportReceived} event.
     * @custom:error StreamfundValidationError if the amount is insufficient, the streamer
     * or video is not registered, the token is not allowed, the message is too long,
     * or the allowance is insufficient.
     */
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
        // if (block.chainid != 11155111) {
        //     revert StreamfundValidationError("Only base sepolia chain is supported");
        // }

        AllowedToken memory details = _getTokenDetails(_allowedToken);
        uint256 pfDecimal = uint256(PriceConverter.getDecimal(details.priceFeed));

        uint256 usdPrice = getVideo(_videoId) * 10 ** 6;
        uint256 tokenPrice = PriceConverter.getPrice(details.priceFeed) / 10 ** (pfDecimal - 6);
        uint256 costToSupport = (usdPrice * 10 ** 6) / tokenPrice;
        if (_amount < costToSupport) {
            revert StreamfundValidationError("Insufficient amount");
        }

        uint256 allowance = IERC20(_allowedToken).allowance(msg.sender, address(this));
        if (allowance < _amount) {
            revert StreamfundValidationError("Insufficient allowance");
        }

        IERC20(_allowedToken).safeTransferFrom(msg.sender, _streamer, _amount);
        _addTokenSupport(_streamer, _allowedToken, _amount);
        emit VideoSupportReceived(_streamer, msg.sender, _videoId, _allowedToken, _amount, _message);
    }

    /**
     * @notice Support a streamer with live ads using ETH.
     * @param _streamer The address of the streamer to support.
     * @param _message A message to send along with the support.
     * @dev The message length must be less than or equal to 150 bytes.
     * @dev The amount of ETH sent must be greater than or equal to the cost to support the live ads.
     * @dev The streamer must be registered.
     * @dev Emits a {LiveAdsReceived} event.
     * @custom:error StreamfundValidationError if the amount is insufficient, the streamer
     * is not registered, or the message is too long.
     */
    function liveAdsWithETH(address _streamer, string memory _message) external payable {
        if (!_isStreamerExist(_streamer)) {
            revert StreamfundValidationError("Streamer not registered");
        }
        if (bytes(_message).length > 150) {
            revert StreamfundValidationError("Message too long");
        }
        // if (block.chainid != 11155111) {
        //     revert StreamfundValidationError("Only base sepolia chain is supported");
        // }

        AllowedToken memory details = _getTokenDetails(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);
        uint256 pfDecimal = uint256(PriceConverter.getDecimal(details.priceFeed));
        (, uint256 liveAdsPrice, ) = getStreamerDetails(_streamer);
        if (liveAdsPrice == 0) {
            revert StreamfundValidationError("Streamer not set live ads price");
        }
        uint256 usdPrice = liveAdsPrice * 10 ** 18;
        uint256 tokenPrice = PriceConverter.getPrice(details.priceFeed) * 10 ** (18 - pfDecimal);
        uint256 costToSupport = (usdPrice * 10 ** 18) / tokenPrice;

        if (msg.value < costToSupport) {
            revert StreamfundValidationError("Insufficient amount");
        }

        payable(_streamer).transfer(msg.value);
        _addTokenSupport(_streamer, 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE, msg.value);
        emit LiveAdsReceived(_streamer, msg.sender, 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE, msg.value, _message);
    }

    /**
     * @notice Support a streamer with live ads using a specific ERC20 token.
     * @param _streamer The address of the streamer to support.
     * @param _allowedToken The address of the ERC20 token to use for support.
     * @param _amount The amount of tokens to send.
     * @param _message A message to send along with the support.
     * @dev The message length must be less than or equal to 150 bytes.
     * @dev The amount of tokens sent must be greater than or equal to the cost to support the live ads.
     * @dev The streamer and token must be registered.
     * @dev Emits a {LiveAdsReceived} event.
     * @custom:error StreamfundValidationError if the amount is insufficient, the
     * streamer is not registered, the token is not allowed, the message is too long,
     * or the allowance is insufficient.
     */
    function liveAdsWithToken(
        address _streamer,
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
        if (bytes(_message).length > 150) {
            revert StreamfundValidationError("Message too long");
        }
        // if (block.chainid != 11155111) {
        //     revert StreamfundValidationError("Only base sepolia chain is supported");
        // }

        AllowedToken memory details = _getTokenDetails(_allowedToken);
        uint256 pfDecimal = uint256(PriceConverter.getDecimal(details.priceFeed));
        (, uint256 liveAdsPrice, ) = getStreamerDetails(_streamer);
        if (liveAdsPrice == 0) {
            revert StreamfundValidationError("Streamer not set live ads price");
        }
        uint256 usdPrice = liveAdsPrice * 10 ** 6;
        uint256 tokenPrice = PriceConverter.getPrice(details.priceFeed) / 10 ** (pfDecimal - 6);
        uint256 costToSupport = (usdPrice * 10 ** 6) / tokenPrice;
        if (_amount < costToSupport) {
            revert StreamfundValidationError("Insufficient amount");
        }

        uint256 allowance = IERC20(_allowedToken).allowance(msg.sender, address(this));
        if (allowance < _amount) {
            revert StreamfundValidationError("Insufficient allowance");
        }

        IERC20(_allowedToken).safeTransferFrom(msg.sender, _streamer, _amount);
        _addTokenSupport(_streamer, _allowedToken, _amount);
        emit LiveAdsReceived(_streamer, msg.sender, _allowedToken, _amount, _message);
    }

    /**
     * @notice Get the price and decimal of an allowed token.
     * @param _token The address of the token to get the price for.
     * @return price The price of the token.
     * @return decimal The decimal places of the token price.
     * @dev Returns (0, 0) if the token is not allowed.
     */
    function getAllowedTokenPrice(address _token) external view returns (uint256 price, uint8 decimal) {
        if (!_isTokenAvailable(_token)) {
            return (0, 0);
        }
        price = PriceConverter.getPrice(allowedTokens[_token].priceFeed);
        decimal = PriceConverter.getDecimal(allowedTokens[_token].priceFeed);
        return (price, decimal);
    }
}
