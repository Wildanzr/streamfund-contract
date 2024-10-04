// SPDX-License-Identifier: MIT

pragma solidity >=0.8.9;

import { TokenManagement } from "./TokenManagement.sol";
import { PriceConverter } from "./PriceConverter.sol";
import { AggregatorV3Interface } from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract Streamfund is TokenManagement {
    using PriceConverter for uint256;
    uint256 public totalFunds;

    AggregatorV3Interface private ethPriceFeed = AggregatorV3Interface(0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1);
    AggregatorV3Interface private btcPriceFeed = AggregatorV3Interface(0x0FB99723Aee6f420beAD13e6bBB79b7E6F034298);
    AggregatorV3Interface private usdtPriceFeed = AggregatorV3Interface(0x3ec8593F930EA45ea58c968260e6e9FF53FC934f);

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
