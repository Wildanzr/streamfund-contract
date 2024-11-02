// SPDX-License-Identifier: MIT

pragma solidity >=0.8.9;

import { AggregatorV3Interface } from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    /**
     * @notice Gets the latest price from the price feed
     * @param _priceFeed The address of the price feed contract
     * @return The latest price as a uint256
     */
    function getPrice(AggregatorV3Interface _priceFeed) internal view returns (uint256) {
        (, int256 price, , , ) = _priceFeed.latestRoundData();
        return uint256(price);
    }

    /**
     * @notice Converts a given amount of tokens to its equivalent value in USD
     * @param _amount The amount of tokens to convert
     * @param _priceFeed The address of the price feed contract
     * @return The equivalent value in USD as a uint256
     */
    function getConversionRate(uint256 _amount, AggregatorV3Interface _priceFeed) internal view returns (uint256) {
        uint256 tokenPrice = getPrice(_priceFeed);
        uint256 priceInUSD = (tokenPrice * _amount);
        return priceInUSD;
    }

    /**
     * @notice Gets the version of the price feed contract
     * @param _priceFeed The address of the price feed contract
     * @return The version of the price feed contract as a uint256
     */
    function getVersion(AggregatorV3Interface _priceFeed) internal view returns (uint256) {
        return _priceFeed.version();
    }

    /**
     * @notice Gets the number of decimals used by the price feed
     * @param _priceFeed The address of the price feed contract
     * @return The number of decimals as a uint8
     */
    function getDecimal(AggregatorV3Interface _priceFeed) internal view returns (uint8) {
        return _priceFeed.decimals();
    }
}
