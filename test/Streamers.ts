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

    it("Shoudl registered perfectly as streamer", async function () {
      await this.streamers.connect(this.accounts[0]).registerAsStreamer();
      const streamerCount = await this.streamers.streamerCount();
      expect(streamerCount).to.be.equal(1);
    });
  });
});
