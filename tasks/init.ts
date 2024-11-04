import { parseEther } from "ethers";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { Streamfund } from "../types";

interface AllowedToken {
  address: string;
  priceFeed: string;
  decimal: number;
  symbol: string;
}

task("task:add", "Add initial allowed token to Streamfund").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const signers = await ethers.getSigners();
  const streamfundAddress = "0xcaFcAF4Aa0949dA2d3D3b303291c951301B75821";

  const candidate: AllowedToken[] = [
    {
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      priceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
      decimal: 18,
      symbol: "ETH",
    },
    {
      address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      priceFeed: "0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E",
      decimal: 6,
      symbol: "USDC",
    },
  ];

  for (let i = 0; i < candidate.length; i++) {
    console.log(`Adding ${candidate[i].symbol} to Streamfund`);
    const streamfund = (await ethers.getContractAt("Streamfund", streamfundAddress)) as Streamfund;
    const [tx] = await Promise.all([
      streamfund
        .connect(signers[0])
        .addAllowedToken(candidate[i].address, candidate[i].priceFeed, candidate[i].decimal, candidate[i].symbol),
    ]);

    console.log(`Tx hash: ${tx.hash}`);
  }
});

task("task:remove", "Remove initial allowed token to Streamfund").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const signers = await ethers.getSigners();
  const streamfundAddress = "0xcaFcAF4Aa0949dA2d3D3b303291c951301B75821";

  const candidate: AllowedToken[] = [
    {
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      priceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
      decimal: 18,
      symbol: "ETH",
    },
    {
      address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      priceFeed: "0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E",
      decimal: 6,
      symbol: "USDC",
    },
  ];

  for (let i = 0; i < candidate.length; i++) {
    console.log(`Removing ${candidate[i].symbol} to Streamfund`);
    const streamfund = (await ethers.getContractAt("Streamfund", streamfundAddress)) as Streamfund;
    const [tx] = await Promise.all([streamfund.connect(signers[0]).removeAllowedToken(candidate[i].address)]);

    console.log(`Tx hash: ${tx.hash}`);
  }
});

task("task:support", "Give support to streamer").setAction(async function (taskArguments: TaskArguments, { ethers }) {
  const signers = await ethers.getSigners();
  const streamfundAddress = "0xcaFcAF4Aa0949dA2d3D3b303291c951301B75821";

  const streamer = signers[0].address;
  const amount1 = parseEther("0.0000011");

  const streamfund = (await ethers.getContractAt("Streamfund", streamfundAddress)) as Streamfund;
  const tx = await streamfund.connect(signers[0]).supportWithETH(streamer, "GM", { value: amount1 });
  console.log(`Tx hash: ${tx.hash}`);
});

task("task:updateLiveAds", "Update live ads").setAction(async function (taskArguments: TaskArguments, { ethers }) {
  const signers = await ethers.getSigners();
  const streamfundAddress = "0xcaFcAF4Aa0949dA2d3D3b303291c951301B75821";

  const streamfund = (await ethers.getContractAt("Streamfund", streamfundAddress)) as Streamfund;
  const tx = await streamfund.connect(signers[0]).updateLiveAdsPrice(1);
  console.log(`Tx hash: ${tx.hash}`);

  await tx.wait();
  console.log("Live ads price updated");
});

task("task:liveAdsETH", "Perform live ads").setAction(async function (taskArguments: TaskArguments, { ethers }) {
  const signers = await ethers.getSigners();
  const streamfundAddress = "0xcaFcAF4Aa0949dA2d3D3b303291c951301B75821";
  const streamer = signers[0].address;

  const streamfund = (await ethers.getContractAt("Streamfund", streamfundAddress)) as Streamfund;
  const tx = await streamfund.connect(signers[0]).liveAdsWithETH(streamer, "GM", {
    value: parseEther("0.01"),
  });
  console.log(`Tx hash: ${tx.hash}`);

  await tx.wait();
  console.log("Live ads performed");
});

task("task:liveAdsToken", "Perform live ads with token").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const signers = await ethers.getSigners();
  const streamfundAddress = "0xcaFcAF4Aa0949dA2d3D3b303291c951301B75821";
  const USDCOnSepolia = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
  const streamer = signers[0].address;

  const streamfund = (await ethers.getContractAt("Streamfund", streamfundAddress)) as Streamfund;
  const tx = await streamfund.connect(signers[0]).liveAdsWithToken(streamer, USDCOnSepolia, BigInt(2 * 10 ** 6), "GM");
  console.log(`Tx hash: ${tx.hash}`);

  await tx.wait();
  console.log("Live ads performed");
});

task("task:addVideo", "Add video to Streamfund").setAction(async function (taskArguments: TaskArguments, { ethers }) {
  const signers = await ethers.getSigners();
  const streamfundAddress = "0xcaFcAF4Aa0949dA2d3D3b303291c951301B75821";

  const streamfund = (await ethers.getContractAt("Streamfund", streamfundAddress)) as Streamfund;
  const tx = await streamfund.connect(signers[0]).addVideo("https://video.com/1.mp4", "https://thumbnail.com/1.jpg", 1);
  console.log(`Tx hash: ${tx.hash}`);

  await tx.wait();
  console.log("Video added");
});

task("task:removeVideo", "Remove video from Streamfund").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const signers = await ethers.getSigners();
  const streamfundAddress = "0xcaFcAF4Aa0949dA2d3D3b303291c951301B75821";
  const videoId = "0x15B99385560E0C112DA847CD24AB34CC6FA6A5F5213D084617362629CB292FD9";

  const streamfund = (await ethers.getContractAt("Streamfund", streamfundAddress)) as Streamfund;
  const tx = await streamfund.connect(signers[0]).removeVideo(videoId);
  console.log(`Tx hash: ${tx.hash}`);

  await tx.wait();
  console.log("Video removed");
});

task("task:supportVideoETH", "Support video with ETH").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const signers = await ethers.getSigners();
  const streamfundAddress = "0xcaFcAF4Aa0949dA2d3D3b303291c951301B75821";
  const videoId = "0x3c2ff8c4beba19c24124de74238c053b5b091ca12ae0a6667f9d64d1d6bd26d3";
  const streamer = signers[0].address;

  console.log("Streamer", streamer);
  console.log("Video ID", videoId);

  const streamfund = (await ethers.getContractAt("Streamfund", streamfundAddress)) as Streamfund;
  const tx = await streamfund.connect(signers[0]).supportWithVideoETH(streamer, videoId, "GM", {
    value: parseEther("0.01"),
  });
  console.log(`Tx hash: ${tx.hash}`);

  await tx.wait();
  console.log("Supported video with ETH");
});

task("task:register", "Register as streamer").setAction(async function (taskArguments: TaskArguments, { ethers }) {
  const signers = await ethers.getSigners();
  const streamfundAddress = "0xcaFcAF4Aa0949dA2d3D3b303291c951301B75821";

  console.log("Registering as streamer...");
  const streamfund = (await ethers.getContractAt("Streamfund", streamfundAddress)) as Streamfund;
  const tx = await streamfund.connect(signers[0]).registerAsStreamer();
  console.log(`Tx hash: ${tx.hash}`);

  await tx.wait();
  console.log("Registered as streamer");
});
