// SPDX-License-Identifier: MIT

pragma solidity >=0.8.9;

import { TokenManagement } from "./TokenManagement.sol";
import { PriceConverter } from "./PriceConverter.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { AggregatorV3Interface } from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract Streamfund is AccessControl, TokenManagement {
    using PriceConverter for uint256;

    bytes32 private constant EDITOR_ROLE = keccak256("EDITOR_ROLE");
    uint256 public totalFunds;

    AggregatorV3Interface private ethPriceFeed;
    AggregatorV3Interface private btcPriceFeed;
    AggregatorV3Interface private usdtPriceFeed;

    constructor(address _ethPriceFeed, address _btcPriceFeed, address _usdtPriceFeed) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(EDITOR_ROLE, msg.sender);
        ethPriceFeed = AggregatorV3Interface(_ethPriceFeed);
        btcPriceFeed = AggregatorV3Interface(_btcPriceFeed);
        usdtPriceFeed = AggregatorV3Interface(_usdtPriceFeed);
    }

    function getVersion() public view returns (uint256) {
        return PriceConverter.getVersion(ethPriceFeed);
    }

    function getEthPrice() public view returns (uint256) {
        return PriceConverter.getPrice(ethPriceFeed);
    }

    function getBtcPrice() public view returns (uint256) {
        return PriceConverter.getPrice(btcPriceFeed);
    }

    function getUsdtPrice() public view returns (uint256) {
        return PriceConverter.getPrice(usdtPriceFeed);
    }

    function getEthConversionRate(uint256 _amount) public view returns (uint256) {
        return PriceConverter.getConversionRate(_amount, ethPriceFeed);
    }

    function getBtcConversionRate(uint256 _amount) public view returns (uint256) {
        return PriceConverter.getConversionRate(_amount, btcPriceFeed);
    }

    function getUsdtConversionRate(uint256 _amount) public view returns (uint256) {
        return PriceConverter.getConversionRate(_amount, usdtPriceFeed);
    }
}
