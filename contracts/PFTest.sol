// SPDX-License-Identifier: MIT

pragma solidity >=0.8.9;

import { AggregatorV3Interface } from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import { PriceConverter } from "./PriceConverter.sol";
import { Tokens } from "./Tokens.sol";

contract PFTest is Tokens {
    function gPrice(AggregatorV3Interface _priceFeed) public view returns (uint256) {
        return PriceConverter.getPrice(_priceFeed);
    }

    function gDecimal(AggregatorV3Interface _priceFeed) public view returns (uint8) {
        return PriceConverter.getDecimal(_priceFeed);
    }

    function gConversionRate(uint256 _amount, AggregatorV3Interface _priceFeed) public view returns (uint256) {
        return PriceConverter.getConversionRate(_amount, _priceFeed);
    }

    function gVersion(AggregatorV3Interface _priceFeed) public view returns (uint256) {
        return PriceConverter.getVersion(_priceFeed);
    }
}
