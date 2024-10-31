import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { deployVideosFixture } from "./fixture/Videos.fixture";
import type { Signers } from "./types";

const KECCAK_EDITOR_ROLE = "0x21d1167972f621f75904fb065136bc8b53c7ba1c60ccd3a7758fbee465851e9c";
const KECCAK_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

describe("Videos", function () {
  before(async function () {
    this.signers = {} as Signers;

    const signers = await ethers.getSigners();
    this.signers.admin = signers[0];

    this.loadFixture = loadFixture;
  });

  describe("Deployment", function () {
    beforeEach(async function () {
      const { videos, owner } = await this.loadFixture(deployVideosFixture);

      this.videos = videos;
      this.owner = owner;
    });

    it("Should set the right default admin and editor role", async function () {
      expect(await this.videos.hasRole(KECCAK_ADMIN_ROLE, this.owner.address)).to.be.true;
      expect(await this.videos.hasRole(KECCAK_EDITOR_ROLE, this.owner.address)).to.be.true;
    });
  });

  describe("Add Video", function () {
    beforeEach(async function () {
      const { videos, videoManagement_address, owner, accounts } = await this.loadFixture(deployVideosFixture);

      this.videos = videos;
      this.videoManagement_address = videoManagement_address;
      this.owner = owner;
      this.editor = accounts[0];
    });

    it("Should fail because caller is not an editor", async function () {
      await expect(
        this.videos.connect(this.editor).addVideo("https://video.com/1.mp4", "https://thumbnail.com/1.jpg", 1),
      ).to.be.revertedWithCustomError(this.videos, "AccessControlUnauthorizedAccount");
    });

    it("Should fail because video url is empty", async function () {
      await expect(this.videos.addVideo("", "https://thumbnail.com/1.jpg", 1)).to.be.revertedWithCustomError(
        this.videos,
        "VideoValidationError",
      );
    });

    it("Should fail because thumbnail url is empty", async function () {
      await expect(this.videos.addVideo("https://video.com/1.mp4", "", 1)).to.be.revertedWithCustomError(
        this.videos,
        "VideoValidationError",
      );
    });

    it("Should fail because video duration is zero", async function () {
      await expect(
        this.videos.addVideo("https://video.com/1.mp4", "https://thumbnail.com/1.jpg", 0),
      ).to.be.revertedWithCustomError(this.videos, "VideoValidationError");
    });

    it("Should add video successfully", async function () {
      await expect(this.videos.addVideo("https://video.com/1.mp4", "https://thumbnail.com/1.jpg", 1)).to.be.emit(
        this.videos,
        "VideoAdded",
      );

      const res = await this.videos.addVideo("https://video.com/1.mp4", "https://thumbnail.com/1.jpg", 1);
      const result = await res.wait();
      const log = result?.logs[0] as unknown as { args: string[] };

      const video = await this.videos.getVideo(log.args[0]);
      expect(video).to.be.equal(log.args[3]);
    });
  });

  describe("Remove Video", function () {
    beforeEach(async function () {
      const { videos, videoManagement_address, owner, accounts } = await this.loadFixture(deployVideosFixture);

      this.videos = videos;
      this.videoManagement_address = videoManagement_address;
      this.owner = owner;
      this.editor = accounts[0];
    });

    it("Should fail because caller is not an editor", async function () {
      const videoId = "0xd4996b473e4311537453d640a8c017";
      const parsedBytes32 = "0x" + videoId.slice(2).padStart(64, "0");
      await expect(this.videos.connect(this.editor).removeVideo(parsedBytes32)).to.be.revertedWithCustomError(
        this.videos,
        "AccessControlUnauthorizedAccount",
      );
    });

    it("Should fail to remove video because video id is not found", async function () {
      const videoId = "0xd4996b473e4311537453d640a8c017";
      const parsedBytes32 = "0x" + videoId.slice(2).padStart(64, "0");
      await expect(this.videos.removeVideo(parsedBytes32)).to.be.revertedWithCustomError(
        this.videos,
        "VideoValidationError",
      );
    });

    it("Should remove video successfully", async function () {
      const tx = await this.videos.addVideo("https://video.com/1.mp4", "https://thumbnail.com/1.jpg", 1);
      const result = await tx.wait();
      const log = result?.logs[0] as unknown as { args: string[] };

      let video = await this.videos.getVideo(log.args[0]);
      expect(video).to.be.equal(log.args[3]);

      const videoId = log.args[0];
      const parsedBytes32 = "0x" + videoId.slice(2).padStart(64, "0");
      await expect(this.videos.removeVideo(parsedBytes32)).to.be.emit(this.videos, "VideoRemoved");

      video = await this.videos.getVideo(log.args[0]);
      expect(video).to.be.equal(0);
    });
  });
});
