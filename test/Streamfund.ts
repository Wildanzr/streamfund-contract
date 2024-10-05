import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
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

  describe("Register as streamer", function () {
    beforeEach(async function () {
      const { streamfund, owner, accounts } = await this.loadFixture(deployStreamfundFixture);

      this.streamfund = streamfund;
      this.owner = owner;
      this.accounts = accounts;
    });
  });
});
