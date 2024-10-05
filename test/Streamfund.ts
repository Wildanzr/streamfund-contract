import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseEther } from "ethers";
import { ethers } from "hardhat";

import { deployStreamfundFixture } from "./fixture/Streamfund.fixture";
import type { Signers } from "./types";

const KECCAK_EDITOR_ROLE = "0x21d1167972f621f75904fb065136bc8b53c7ba1c60ccd3a7758fbee465851e9c";
const KECCAK_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

describe("Streamfund", function () {
  before(async function () {
    this.signers = {} as Signers;

    const signers = await ethers.getSigners();
    this.signers.admin = signers[0];

    this.loadFixture = loadFixture;
  });

  describe("Deployment", function () {
    beforeEach(async function () {
      const { streamfund, owner } = await this.loadFixture(deployStreamfundFixture);

      this.streamfund = streamfund;
      this.owner = owner;
    });

    it("Should set the right default admin and editor role", async function () {
      expect(await this.streamfund.hasRole(KECCAK_ADMIN_ROLE, this.owner.address)).to.be.true;
      expect(await this.streamfund.hasRole(KECCAK_EDITOR_ROLE, this.owner.address)).to.be.true;
    });
  });

  describe("Support with ETH", function () {
    this.beforeEach(async function () {
      const { streamfund, accounts } = await this.loadFixture(deployStreamfundFixture);

      this.streamfund = streamfund;
      this.accounts = accounts;

      await this.streamfund.connect(this.accounts[0]).registerAsStreamer();
      const streamerCount = await this.streamfund.streamerCount();
      expect(streamerCount).to.be.equal(1);
    });

    it("Should failed to support because value is zero", async function () {
      await expect(
        this.streamfund.connect(this.accounts[1]).supportWithETH(this.accounts[0].address, "Thanks", {
          value: 0,
        }),
      ).to.be.revertedWithCustomError(this.streamfund, "StreamfundValidationError");
    });

    it("Should failed to support because streamer is not registered", async function () {
      await expect(
        this.streamfund.connect(this.accounts[2]).supportWithETH(this.accounts[1].address, "Thanks", {
          value: parseEther("1"),
        }),
      ).to.be.revertedWithCustomError(this.streamfund, "StreamfundValidationError");
    });

    it("Should support perfectly ", async function () {
      const preBalance = await ethers.provider.getBalance(this.accounts[0]);

      await expect(
        this.streamfund.connect(this.accounts[1]).supportWithETH(this.accounts[0].address, "Thanks", {
          value: parseEther("1"),
        }),
      )
        .to.be.emit(this.streamfund, "SupportReceived")
        .withArgs(this.accounts[0], "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", parseEther("1"), "Thanks");

      const postBalance = await ethers.provider.getBalance(this.accounts[0]);
      const streamerDetails = await this.streamfund.getStreamerDetails(this.accounts[0].address);
      expect(streamerDetails[1][0][1]).to.be.equal(parseEther("1"));
      expect(postBalance).to.be.equal(preBalance + parseEther("1"));
    });
  });
});
