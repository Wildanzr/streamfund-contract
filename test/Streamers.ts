import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { deployStreamersFixture } from "./fixture/Streamers.fixture";
import type { Signers } from "./types";

const KECCAK_EDITOR_ROLE = "0x21d1167972f621f75904fb065136bc8b53c7ba1c60ccd3a7758fbee465851e9c";
const KECCAK_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

describe("Streamers", function () {
  before(async function () {
    this.signers = {} as Signers;

    const signers = await ethers.getSigners();
    this.signers.admin = signers[0];

    this.loadFixture = loadFixture;
  });

  describe("Deployment", function () {
    this.beforeEach(async function () {
      const { streamers } = await this.loadFixture(deployStreamersFixture);

      this.streamers = streamers;
    });

    it("Should have 0 streamers", async function () {
      const streamerCount = await this.streamers.streamerCount();
      expect(streamerCount).to.be.equal(0);
    });
  });

  describe("Register as streamer", function () {
    this.beforeEach(async function () {
      const { streamers, accounts } = await this.loadFixture(deployStreamersFixture);

      this.streamers = streamers;
      this.accounts = accounts;
    });

    it("Should failed to register because address already registered", async function () {
      await this.streamers.connect(this.accounts[0]).registerAsStreamer();
      await expect(this.streamers.connect(this.accounts[0]).registerAsStreamer()).to.be.revertedWithCustomError(
        this.streamers,
        "StreamerValidationError",
      );
    });

    it("Should registered perfectly as streamer", async function () {
      await this.streamers.connect(this.accounts[0]).registerAsStreamer();
      const streamerCount = await this.streamers.streamerCount();
      expect(streamerCount).to.be.equal(1);
    });
  });

  describe("Update live ads price", function () {
    this.beforeEach(async function () {
      const { streamers, accounts } = await this.loadFixture(deployStreamersFixture);

      this.streamers = streamers;
      this.accounts = accounts;
    });

    it("Should failed to update live ads price because streamer is not registered", async function () {
      await expect(this.streamers.connect(this.accounts[0]).updateLiveAdsPrice(100)).to.be.revertedWithCustomError(
        this.streamers,
        "StreamerValidationError",
      );
    });

    it("Should update live ads perfectly", async function () {
      await this.streamers.connect(this.accounts[0]).registerAsStreamer();
      await this.streamers.connect(this.accounts[0]).updateLiveAdsPrice(100);
      const streamer = await this.streamers.getStreamerDetails(this.accounts[0].address);
      expect(streamer[1]).to.be.equal(BigInt(100));
    });
  });

  describe("Get streamer details", function () {
    this.beforeEach(async function () {
      const { streamers, accounts } = await this.loadFixture(deployStreamersFixture);

      this.streamers = streamers;
      this.accounts = accounts;
    });

    it("Should failed to get streamer details because streamer is not registered", async function () {
      const streamer = await this.streamers.getStreamerDetails(this.accounts[0].address);
      expect(streamer[0]).to.be.equal(0);
    });

    it("Should get streamer details perfectly", async function () {
      await this.streamers.connect(this.accounts[0]).registerAsStreamer();
      const streamer = await this.streamers.getStreamerDetails(this.accounts[0].address);
      expect(streamer[2][0][0]).to.be.equal("0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE");
    });
  });
});
