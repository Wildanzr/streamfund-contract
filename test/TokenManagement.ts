import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { deployTokenManagementFixture } from "./fixture/TokenManagement.fixture";
import type { Signers } from "./types";

const KECCAK_EDITOR_ROLE = "0x21d1167972f621f75904fb065136bc8b53c7ba1c60ccd3a7758fbee465851e9c";
const KECCAK_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
const dummyTokenAddress = [
  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "0x0555E30da8f98308EdB960aa94C0Db47230d2B9c",
  "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
];

describe("TokenManagement", function () {
  before(async function () {
    this.signers = {} as Signers;

    const signers = await ethers.getSigners();
    this.signers.admin = signers[0];

    this.loadFixture = loadFixture;
  });

  describe("Deployment", function () {
    beforeEach(async function () {
      const { tokens, owner } = await this.loadFixture(deployTokenManagementFixture);

      this.tokens = tokens;
      this.owner = owner;
    });

    it("Should set the right default admin and editor role", async function () {
      expect(await this.tokens.hasRole(KECCAK_ADMIN_ROLE, this.owner.address)).to.be.true;
      expect(await this.tokens.hasRole(KECCAK_EDITOR_ROLE, this.owner.address)).to.be.true;
    });
  });

  describe("Add Token", function () {
    beforeEach(async function () {
      const { tokens, tokenManagement_address, owner, editor } = await this.loadFixture(deployTokenManagementFixture);

      this.tokens = tokens;
      this.tokenManagement_address = tokenManagement_address;
      this.owner = owner;
      this.editor = editor;
    });

    it("Should fail because caller is not an editor", async function () {
      await expect(
        this.tokens.connect(this.editor).addAllowedToken(dummyTokenAddress[0], dummyTokenAddress[1], 18, "USDT"),
      ).to.be.revertedWithCustomError(this.tokens, "AccessControlUnauthorizedAccount");
    });

    it("Should fail because token address is zero address", async function () {
      await expect(
        this.tokens.addAllowedToken(ethers.ZeroAddress, dummyTokenAddress[0], 18, "USDT"),
      ).to.be.revertedWithCustomError(this.tokens, "TokenValidationError");
    });

    it("Should fail because pricefeed address is zero address", async function () {
      await expect(
        this.tokens.addAllowedToken(dummyTokenAddress[0], ethers.ZeroAddress, 18, "USDT"),
      ).to.be.revertedWithCustomError(this.tokens, "TokenValidationError");
    });

    it("Should fail because symbol is empty", async function () {
      await expect(
        this.tokens.addAllowedToken(dummyTokenAddress[0], dummyTokenAddress[1], 18, ""),
      ).to.be.revertedWithCustomError(this.tokens, "TokenValidationError");
    });

    it("Should fail because decimal is zero", async function () {
      await expect(
        this.tokens.addAllowedToken(dummyTokenAddress[0], dummyTokenAddress[1], 0, "USDT"),
      ).to.be.revertedWithCustomError(this.tokens, "TokenValidationError");
    });

    it("Should add token successfully", async function () {
      await expect(await this.tokens.addAllowedToken(dummyTokenAddress[0], dummyTokenAddress[1], 18, "USDT"))
        .to.be.emit(this.tokens, "TokenAdded")
        .withArgs(dummyTokenAddress[0], dummyTokenAddress[1], 18, "USDT");

      const allowedTokens = await this.tokens.getAllowedTokens();
      expect(allowedTokens[0].length).to.be.deep.equal(1);
      expect(allowedTokens[0][0]).to.be.equal(dummyTokenAddress[0]);
    });
  });

  describe("Remove Token", function () {
    beforeEach(async function () {
      const { tokens, tokenManagement_address, owner, editor } = await this.loadFixture(deployTokenManagementFixture);

      this.tokens = tokens;
      this.tokenManagement_address = tokenManagement_address;
      this.owner = owner;
      this.editor = editor;
    });

    it("Should fail because caller is not an editor", async function () {
      await expect(
        this.tokens.connect(this.editor).removeAllowedToken(dummyTokenAddress[0]),
      ).to.be.revertedWithCustomError(this.tokens, "AccessControlUnauthorizedAccount");
    });

    it("Should fail because token address is zero address", async function () {
      await expect(this.tokens.removeAllowedToken(ethers.ZeroAddress)).to.be.revertedWithCustomError(
        this.tokens,
        "TokenValidationError",
      );
    });

    it("Should fail because token is not found", async function () {
      await expect(this.tokens.removeAllowedToken(dummyTokenAddress[0])).to.be.revertedWithCustomError(
        this.tokens,
        "TokenValidationError",
      );
    });

    it("Should remove token successfully", async function () {
      await this.tokens.addAllowedToken(dummyTokenAddress[0], dummyTokenAddress[1], 18, "USDT");

      await expect(await this.tokens.removeAllowedToken(dummyTokenAddress[0]))
        .to.be.emit(this.tokens, "TokenRemoved")
        .withArgs(dummyTokenAddress[0]);

      const allowedTokens = await this.tokens.getAllowedTokens();
      expect(allowedTokens[0].length).to.be.deep.equal(0);
    });
  });
});
