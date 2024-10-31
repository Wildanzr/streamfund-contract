import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers";
import { ethers } from "hardhat";

import { deployPFTestFixture } from "./fixture/PriceFeed.fixture";
import type { Signers } from "./types";

const KECCAK_EDITOR_ROLE = "0x21d1167972f621f75904fb065136bc8b53c7ba1c60ccd3a7758fbee465851e9c";
const KECCAK_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

describe("PriceFeed", function () {
  before(async function () {
    this.signers = {} as Signers;

    const signers = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.loadFixture = loadFixture;

    const { owner, accounts, deployedERC20, deployedPriceFeed, pFTest, priceFeeds } =
      await this.loadFixture(deployPFTestFixture);

    this.owner = owner;
    this.accounts = accounts;
    this.deployedERC20 = deployedERC20;
    this.deployedPriceFeed = deployedPriceFeed;
    this.pfTest = pFTest;
    this.priceFeeds = priceFeeds;

    for (let i = 0; i < this.deployedERC20.length; i++) {
      const [tokenAddr, pfAddr, decimal, symbol] = await Promise.all([
        this.deployedERC20[i].getAddress(),
        this.deployedPriceFeed[i].getAddress(),
        this.deployedERC20[i].decimals(),
        this.deployedERC20[i].symbol(),
      ]);
      await this.deployedERC20[i].connect(this.owner).mintTo(this.accounts[1].address, BigInt(0.1 * 10 ** 18));
      await this.deployedERC20[i].connect(this.accounts[1]).mint();
      if (i !== this.deployedERC20.length - 1) {
        await this.pfTest.addAllowedToken(tokenAddr, pfAddr, decimal, symbol);
      }
    }
  });

  describe("Get Price", function () {
    it("Should get price", async function () {
      for (let i = 0; i < this.deployedERC20.length; i++) {
        const [, pfAddr, ,] = await Promise.all([
          this.deployedERC20[i].getAddress(),
          this.deployedPriceFeed[i].getAddress(),
          this.deployedERC20[i].decimals(),
          this.deployedERC20[i].symbol(),
        ]);

        if (i !== this.deployedERC20.length - 1) {
          const price = await this.pfTest.gPrice(pfAddr);
          expect(parseUnits(this.priceFeeds[i].price, 8)).to.be.equal(price);
        }
      }
    });
  });

  describe("Get Decimals", function () {
    it("Should get decimals", async function () {
      for (let i = 0; i < this.deployedERC20.length; i++) {
        const [, pfAddr, ,] = await Promise.all([
          this.deployedERC20[i].getAddress(),
          this.deployedPriceFeed[i].getAddress(),
          this.deployedERC20[i].decimals(),
          this.deployedERC20[i].symbol(),
        ]);

        if (i !== this.deployedERC20.length - 1) {
          const decimals = await this.pfTest.gDecimal(pfAddr);
          expect(this.priceFeeds[i].decimal).to.be.equal(decimals);
        }
      }
    });
  });

  describe("Get Version", function () {
    it("Should get version", async function () {
      for (let i = 0; i < this.deployedERC20.length; i++) {
        const [, pfAddr, ,] = await Promise.all([
          this.deployedERC20[i].getAddress(),
          this.deployedPriceFeed[i].getAddress(),
          this.deployedERC20[i].decimals(),
          this.deployedERC20[i].symbol(),
        ]);

        if (i !== this.deployedERC20.length - 1) {
          const version = await this.pfTest.gVersion(pfAddr);
          expect(0).to.be.equal(version);
        }
      }
    });
  });

  describe("Get Conversion Rate", function () {
    it("Should get conversion rate", async function () {
      for (let i = 0; i < this.deployedERC20.length; i++) {
        const [, pfAddr, ,] = await Promise.all([
          this.deployedERC20[i].getAddress(),
          this.deployedPriceFeed[i].getAddress(),
          this.deployedERC20[i].decimals(),
          this.deployedERC20[i].symbol(),
        ]);

        const tokenAmount = 15;
        const rate = await this.pfTest.gConversionRate(BigInt(tokenAmount), pfAddr);
        const realPrice = tokenAmount * Number(this.priceFeeds[i].price);
        expect(parseUnits(realPrice.toString(), 8)).to.be.equal(rate);
      }
    });
  });
});
