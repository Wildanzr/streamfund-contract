import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseEther, parseUnits } from "ethers";
import { ethers } from "hardhat";

import { deployStreamfundFixture } from "./fixture/Streamfund.fixture";
import type { Signers } from "./types";

const KECCAK_EDITOR_ROLE = "0x21d1167972f621f75904fb065136bc8b53c7ba1c60ccd3a7758fbee465851e9c";
const KECCAK_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
const RANDOM_VIDEO_ID = "0x43641f4611acb863d4c0c0a3a261d365ea2db16589a2c5a97ef7f4591b5b774f";

describe("Streamfund", function () {
  before(async function () {
    this.signers = {} as Signers;

    const signers = await ethers.getSigners();
    this.signers.admin = signers[0];

    this.loadFixture = loadFixture;
  });

  describe("Deployment", function () {
    this.beforeEach(async function () {
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

      // Register one streamer
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

    it("Should failed to support because message is too long", async function () {
      await expect(
        this.streamfund.connect(this.accounts[1]).supportWithETH(this.accounts[0].address, "a".repeat(200), {
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
        .withArgs(
          this.accounts[0],
          this.accounts[1].address,
          "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
          parseEther("1"),
          "Thanks",
        );

      const postBalance = await ethers.provider.getBalance(this.accounts[0]);
      const streamerDetails = await this.streamfund.getStreamerDetails(this.accounts[0].address);
      expect(streamerDetails[2][0][1]).to.be.equal(parseEther("1"));
      expect(postBalance).to.be.equal(preBalance + parseEther("1"));
    });
  });

  describe("Support with Token", function () {
    this.beforeEach(async function () {
      const { accounts, deployedERC20, deployedPriceFeed, streamfund, owner } =
        await this.loadFixture(deployStreamfundFixture);

      this.accounts = accounts;
      this.streamfund = streamfund;
      this.deployedERC20 = deployedERC20;
      this.deployedPriceFeed = deployedPriceFeed;
      this.owner = owner;

      // Register one streamer
      await this.streamfund.connect(this.accounts[0]).registerAsStreamer();
      const streamerCount = await this.streamfund.streamerCount();
      expect(streamerCount).to.be.equal(1);

      // Add 3 allowed tokens, 1 for error testing
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
          await this.streamfund.addAllowedToken(tokenAddr, pfAddr, decimal, symbol);
        }
      }
    });

    it("Should failed to mint because caller is not the editor", async function () {
      await expect(
        this.deployedERC20[0].connect(this.accounts[1]).mintTo(this.accounts[1].address, BigInt(0.1 * 10 ** 18)),
      ).to.be.revertedWithCustomError(this.deployedERC20[0], "AccessControlUnauthorizedAccount");
    });

    it("Should failed to support because value is zero", async function () {
      await expect(
        this.streamfund
          .connect(this.accounts[1])
          .supportWithToken(this.accounts[0].address, await this.deployedERC20[0].getAddress(), 0, "Thanks"),
      ).to.be.revertedWithCustomError(this.streamfund, "StreamfundValidationError");
    });

    it("Should failed to support because streamer is not registered", async function () {
      await expect(
        this.streamfund
          .connect(this.accounts[2])
          .supportWithToken(
            this.accounts[1].address,
            await this.deployedERC20[0].getAddress(),
            BigInt(0.04 * 10 ** 18),
            "Thanks",
          ),
      ).to.be.revertedWithCustomError(this.streamfund, "StreamfundValidationError");
    });

    it("Should failed to support because message is too long", async function () {
      await expect(
        this.streamfund
          .connect(this.accounts[1])
          .supportWithToken(
            this.accounts[0].address,
            await this.deployedERC20[0].getAddress(),
            BigInt(0.04 * 10 ** 18),
            "a".repeat(200),
          ),
      ).to.be.revertedWithCustomError(this.streamfund, "StreamfundValidationError");
    });

    it("Should failed to support because token is not allowed", async function () {
      await expect(
        this.streamfund
          .connect(this.accounts[1])
          .supportWithToken(
            this.accounts[0].address,
            await this.deployedERC20[1].getAddress(),
            BigInt(0.04 * 10 ** 18),
            "Thanks",
          ),
      ).to.be.revertedWithCustomError(this.streamfund, "StreamfundValidationError");
    });

    it("Should failed to support because token allowance is not enough", async function () {
      await expect(
        this.streamfund
          .connect(this.accounts[1])
          .supportWithToken(
            this.accounts[0].address,
            await this.deployedERC20[0].getAddress(),
            BigInt(0.05 * 10 ** 18),
            "Thanks",
          ),
      ).to.be.revertedWithCustomError(this.streamfund, "StreamfundValidationError");
    });

    it("Should support perfectly", async function () {
      await this.deployedERC20[0]
        .connect(this.accounts[1])
        .approve(await this.streamfund.getAddress(), BigInt(0.04 * 10 ** 18));

      const preBalance = await this.deployedERC20[0].balanceOf(this.accounts[0]);

      await expect(
        this.streamfund
          .connect(this.accounts[1])
          .supportWithToken(
            this.accounts[0].address,
            await this.deployedERC20[0].getAddress(),
            BigInt(0.01 * 10 ** 18),
            "Thanks",
          ),
      )
        .to.be.emit(this.streamfund, "SupportReceived")
        .withArgs(
          this.accounts[0],
          this.accounts[1].address,
          await this.deployedERC20[0].getAddress(),
          BigInt(0.01 * 10 ** 18),
          "Thanks",
        );

      const postBalance = await this.deployedERC20[0].balanceOf(this.accounts[0]);
      expect(postBalance).to.be.equal(preBalance + BigInt(0.01 * 10 ** 18));
    });
  });

  describe("Get allowed token price and decimal", function () {
    this.beforeEach(async function () {
      const { accounts, deployedERC20, deployedPriceFeed, streamfund, owner } =
        await this.loadFixture(deployStreamfundFixture);

      this.accounts = accounts;
      this.streamfund = streamfund;
      this.deployedERC20 = deployedERC20;
      this.deployedPriceFeed = deployedPriceFeed;
      this.owner = owner;

      // Add some token and 1 for error testing
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
          await this.streamfund.addAllowedToken(tokenAddr, pfAddr, decimal, symbol);
        }
      }
    });

    it("Should failed to get price because token is not allowed", async function () {
      const [price, decimal] = await this.streamfund.getAllowedTokenPrice(await this.deployedERC20[1].getAddress());
      expect(price).to.be.equal(0);
      expect(decimal).to.be.equal(0);
    });

    it("Should get price and decimal perfectly", async function () {
      const [price, decimal] = await this.streamfund.getAllowedTokenPrice(await this.deployedERC20[0].getAddress());
      expect(price).to.be.equal(parseUnits("2000", 8));
      expect(decimal).to.be.equal(8);
    });
  });

  describe("Pricefeed", function () {
    this.beforeEach(async function () {
      const { accounts, deployedERC20, deployedPriceFeed, streamfund, owner } =
        await this.loadFixture(deployStreamfundFixture);

      this.accounts = accounts;
      this.streamfund = streamfund;
      this.deployedERC20 = deployedERC20;
      this.deployedPriceFeed = deployedPriceFeed;
      this.owner = owner;

      // Add some token and 1 for error testing
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
          await this.streamfund.addAllowedToken(tokenAddr, pfAddr, decimal, symbol);
        }
      }
    });
  });

  describe("Support with Video", function () {
    this.beforeEach(async function () {
      const { accounts, deployedERC20, deployedPriceFeed, streamfund, owner } =
        await this.loadFixture(deployStreamfundFixture);

      this.accounts = accounts;
      this.streamfund = streamfund;
      this.deployedERC20 = deployedERC20;
      this.deployedPriceFeed = deployedPriceFeed;
      this.owner = owner;

      // Add some token and 1 for error testing
      for (let i = 0; i < this.deployedERC20.length; i++) {
        const [tokenAddr, pfAddr, decimal, symbol] = await Promise.all([
          this.deployedERC20[i].getAddress(),
          this.deployedPriceFeed[i].getAddress(),
          this.deployedERC20[i].decimals(),
          this.deployedERC20[i].symbol(),
        ]);
        await this.deployedERC20[i].connect(this.owner).mintTo(this.accounts[1].address, BigInt(10 * 10 ** 18));
        // await this.deployedERC20[i].connect(this.accounts[1]).mint();
        if (i !== this.deployedERC20.length - 1) {
          await this.streamfund.addAllowedToken(tokenAddr, pfAddr, decimal, symbol);
        }
      }

      // Register one streamer
      await this.streamfund.connect(this.accounts[0]).registerAsStreamer();
      const streamerCount = await this.streamfund.streamerCount();
      expect(streamerCount).to.be.equal(1);
    });

    it("Should failed to support because streamer is not registered", async function () {
      const tokenAddr = await this.deployedERC20[0].getAddress();
      await expect(
        this.streamfund
          .connect(this.accounts[1])
          .supportWithVideo(this.accounts[1].address, RANDOM_VIDEO_ID, tokenAddr, "Thanks"),
      ).to.be.revertedWithCustomError(this.streamfund, "StreamfundValidationError");
    });

    it("Should failed to support because token is not allowed", async function () {
      const tokenAddr = await this.deployedERC20[1].getAddress();
      await expect(
        this.streamfund
          .connect(this.accounts[1])
          .supportWithVideo(this.accounts[0].address, RANDOM_VIDEO_ID, tokenAddr, "Thanks"),
      ).to.be.revertedWithCustomError(this.streamfund, "StreamfundValidationError");
    });

    it("Should failed to support because videoId is not valid", async function () {
      const tokenAddr = await this.deployedERC20[0].getAddress();
      await expect(
        this.streamfund
          .connect(this.accounts[1])
          .supportWithVideo(this.accounts[0].address, RANDOM_VIDEO_ID, tokenAddr, "Thanks"),
      ).to.be.revertedWithCustomError(this.streamfund, "StreamfundValidationError");
    });

    it("Should failed to support because message is too long", async function () {
      const tokenAddr = await this.deployedERC20[0].getAddress();
      const res = await this.streamfund.addVideo("https://video.com/1.mp4", "https://thumbnail.com/1.jpg", 1);
      const result = await res.wait();
      const log = result?.logs[0] as unknown as { args: string[] };
      await expect(
        this.streamfund
          .connect(this.accounts[1])
          .supportWithVideo(this.accounts[0].address, log.args[0], tokenAddr, "a".repeat(200)),
      ).to.be.revertedWithCustomError(this.streamfund, "StreamfundValidationError");
    });

    it("Should failed to support because token allowance is not enough", async function () {
      const streamer = await this.accounts[0].getAddress();
      const tokenAddr = await this.deployedERC20[0].getAddress();

      const res = await this.streamfund.addVideo("https://video.com/1.mp4", "https://thumbnail.com/1.jpg", 2000);
      const result = await res.wait();
      const log = result?.logs[0] as unknown as { args: string[] };

      await expect(
        this.streamfund.connect(this.accounts[1]).supportWithVideo(streamer, log.args[0], tokenAddr, "Thanks"),
      ).to.be.revertedWithCustomError(this.streamfund, "StreamfundValidationError");
    });

    it("Should support perfectly", async function () {
      const streamer = await this.accounts[0].getAddress();
      const tokenAddr = await this.deployedERC20[0].getAddress();
      const videoPrice = 100;

      const res = await this.streamfund
        .connect(this.owner)
        .addVideo("https://video.com/1.mp4", "https://thumbnail.com/1.jpg", videoPrice);
      const result = await res.wait();
      const log = result?.logs[0] as unknown as { args: string[] };

      await this.deployedERC20[0]
        .connect(this.accounts[1])
        .approve(await this.streamfund.getAddress(), BigInt(100 * 10 ** 18));

      await expect(
        this.streamfund.connect(this.accounts[1]).supportWithVideo(streamer, log.args[0], tokenAddr, "Thanks"),
      ).to.be.emit(this.streamfund, "VideoSupportReceived");
    });
  });

  describe("Support with Video using ETH", function () {
    this.beforeEach(async function () {
      const { accounts, deployedERC20, deployedPriceFeed, streamfund, owner } =
        await this.loadFixture(deployStreamfundFixture);

      this.accounts = accounts;
      this.streamfund = streamfund;
      this.deployedERC20 = deployedERC20;
      this.deployedPriceFeed = deployedPriceFeed;
      this.owner = owner;

      // Add some token and 1 for error testing
      for (let i = 0; i < this.deployedERC20.length; i++) {
        const [tokenAddr, pfAddr, decimal, symbol] = await Promise.all([
          this.deployedERC20[i].getAddress(),
          this.deployedPriceFeed[i].getAddress(),
          this.deployedERC20[i].decimals(),
          this.deployedERC20[i].symbol(),
        ]);
        await this.deployedERC20[i].connect(this.owner).mintTo(this.accounts[1].address, BigInt(10 * 10 ** 18));
        // await this.deployedERC20[i].connect(this.accounts[1]).mint();
        if (i !== this.deployedERC20.length - 1) {
          await this.streamfund.addAllowedToken(tokenAddr, pfAddr, decimal, symbol);
        }
      }

      const pfAddr = await this.deployedPriceFeed[0].getAddress();
      await this.streamfund.addAllowedToken("0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", pfAddr, 8, "ETH");

      // Register one streamer
      await this.streamfund.connect(this.accounts[0]).registerAsStreamer();
      const streamerCount = await this.streamfund.streamerCount();
      expect(streamerCount).to.be.equal(1);
    });

    it("Should failed to support because value is zero", async function () {
      const videoPrice = 100;
      const res = await this.streamfund
        .connect(this.owner)
        .addVideo("https://video.com/1.mp4", "https://thumbnail.com/1.jpg", videoPrice);
      const result = await res.wait();
      const log = result?.logs[0] as unknown as { args: string[] };

      await expect(
        this.streamfund.connect(this.accounts[1]).supportWithVideoETH(this.accounts[0].address, log.args[0], "Thanks", {
          value: 0,
        }),
      ).to.be.revertedWithCustomError(this.streamfund, "StreamfundValidationError");
    });

    it("Should failed to support because streamer is not registered", async function () {
      const videoPrice = 100;
      const res = await this.streamfund
        .connect(this.owner)
        .addVideo("https://video.com/1.mp4", "https://thumbnail.com/1.jpg", videoPrice);
      const result = await res.wait();
      const log = result?.logs[0] as unknown as { args: string[] };

      await expect(
        this.streamfund.connect(this.accounts[1]).supportWithVideoETH(this.accounts[4].address, log.args[0], "Thanks", {
          value: parseEther("1"),
        }),
      ).to.be.revertedWithCustomError(this.streamfund, "StreamfundValidationError");
    });

    it("Should failed to support because video is not exist", async function () {
      await expect(
        this.streamfund
          .connect(this.accounts[1])
          .supportWithVideoETH(this.accounts[0].address, RANDOM_VIDEO_ID, "Thanks", {
            value: parseEther("1"),
          }),
      ).to.be.revertedWithCustomError(this.streamfund, "StreamfundValidationError");
    });

    it("Should failed to support because message is too long", async function () {
      const videoPrice = 100;
      const res = await this.streamfund
        .connect(this.owner)
        .addVideo("https://video.com/1.mp4", "https://thumbnail.com/1.jpg", videoPrice);
      const result = await res.wait();
      const log = result?.logs[0] as unknown as { args: string[] };

      await expect(
        this.streamfund
          .connect(this.accounts[1])
          .supportWithVideoETH(this.accounts[0].address, log.args[0], "a".repeat(200), {
            value: parseEther("1"),
          }),
      ).to.be.revertedWithCustomError(this.streamfund, "StreamfundValidationError");
    });

    it("Should failed to support because value is too low", async function () {
      const videoPrice = 1000;
      const res = await this.streamfund
        .connect(this.owner)
        .addVideo("https://video.com/1.mp4", "https://thumbnail.com/1.jpg", videoPrice);
      const result = await res.wait();
      const log = result?.logs[0] as unknown as { args: string[] };

      await expect(
        this.streamfund
          .connect(this.accounts[1])
          .supportWithVideoETH(this.accounts[0].address, log.args[0], "Thanks", { value: parseEther("0.0001") }),
      ).to.be.revertedWithCustomError(this.streamfund, "StreamfundValidationError");
    });

    it("Should support perfectly", async function () {
      const videoPrice = 1000;
      const res = await this.streamfund
        .connect(this.owner)
        .addVideo("https://video.com/1.mp4", "https://thumbnail.com/1.jpg", videoPrice);
      const result = await res.wait();
      const log = result?.logs[0] as unknown as { args: string[] };

      await expect(
        this.streamfund
          .connect(this.accounts[1])
          .supportWithVideoETH(this.accounts[0].address, log.args[0], "Thanks", { value: parseEther("1") }),
      ).to.be.emit(this.streamfund, "VideoSupportReceived");
    });
  });
});

// 1000000000000000000
//  500000000000000000
