// SPDX-License-Identifier: MIT

pragma solidity >=0.8.9;

import { AggregatorV3Interface } from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    function getPrice(AggregatorV3Interface _priceFeed) internal view returns (uint256) {
        (, int256 price, , , ) = _priceFeed.latestRoundData();
        return uint256(price);
    }

    function getConversionRate(uint256 _amount, AggregatorV3Interface _priceFeed) internal view returns (uint256) {
        uint256 tokenPrice = getPrice(_priceFeed);
        uint256 priceInUSD = (tokenPrice * _amount) / 1e18;
        return priceInUSD;
    }

    function getVersion(AggregatorV3Interface _priceFeed) internal view returns (uint256) {
        return _priceFeed.version();
    }

    function getDecimal(AggregatorV3Interface _priceFeed) internal view returns (uint8) {
        return _priceFeed.decimals();
    }
}
