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
  const streamfundAddress = "0x63B02bDcA6e209ff0A8dab2E3B244820aE8013f1";

  const candidate: AllowedToken[] = [
    {
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      priceFeed: "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1",
      decimal: 18,
      symbol: "ETH",
    },
    {
      address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      priceFeed: "0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165",
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
  const streamfundAddress = "0x63B02bDcA6e209ff0A8dab2E3B244820aE8013f1";

  const candidate: AllowedToken[] = [
    {
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      priceFeed: "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1",
      decimal: 18,
      symbol: "ETH",
    },
    {
      address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      priceFeed: "0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165",
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
  const streamfundAddress = "0x63B02bDcA6e209ff0A8dab2E3B244820aE8013f1";

  const streamer = "0x53462C7a8b5ad31F0eac94C79E0c341081E4Bfb7";
  const amount1 = parseEther("0.0000011");
  const amount2 = parseEther("0.0000012");
  const amount3 = parseEther("0.0000013");
  const amount4 = parseEther("0.0000014");

  const streamfund = (await ethers.getContractAt("Streamfund", streamfundAddress)) as Streamfund;
  const tx = await streamfund.connect(signers[0]).supportWithETH(streamer, "GM", { value: amount1 });
  console.log(`Tx hash: ${tx.hash}`);

  const streamfund2 = (await ethers.getContractAt("Streamfund", streamfundAddress)) as Streamfund;
  const tx2 = await streamfund2.connect(signers[0]).supportWithETH(streamer, "GM", { value: amount2 });
  console.log(`Tx hash: ${tx2.hash}`);

  const streamfund3 = (await ethers.getContractAt("Streamfund", streamfundAddress)) as Streamfund;
  const tx3 = await streamfund3.connect(signers[0]).supportWithETH(streamer, "GM", { value: amount3 });
  console.log(`Tx hash: ${tx3.hash}`);

  const streamfund4 = (await ethers.getContractAt("Streamfund", streamfundAddress)) as Streamfund;
  const tx4 = await streamfund4.connect(signers[0]).supportWithETH(streamer, "GM", { value: amount4 });
  console.log(`Tx hash: ${tx4.hash}`);
});

task("task:updateLiveAds", "Update live ads").setAction(async function (taskArguments: TaskArguments, { ethers }) {
  const signers = await ethers.getSigners();
  const streamfundAddress = "0x63B02bDcA6e209ff0A8dab2E3B244820aE8013f1";

  const streamfund = (await ethers.getContractAt("Streamfund", streamfundAddress)) as Streamfund;
  const tx = await streamfund.connect(signers[0]).updateLiveAdsPrice(1);
  console.log(`Tx hash: ${tx.hash}`);

  await tx.wait();
  console.log("Live ads price updated");
});

task("task:liveAdsETH", "Perform live ads").setAction(async function (taskArguments: TaskArguments, { ethers }) {
  const signers = await ethers.getSigners();
  const streamfundAddress = "0x63B02bDcA6e209ff0A8dab2E3B244820aE8013f1";
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
  const streamfundAddress = "0x63B02bDcA6e209ff0A8dab2E3B244820aE8013f1";
  const USDCOnBase = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
  const streamer = signers[0].address;

  const streamfund = (await ethers.getContractAt("Streamfund", streamfundAddress)) as Streamfund;
  const tx = await streamfund.connect(signers[0]).liveAdsWithToken(streamer, USDCOnBase, BigInt(2 * 10 ** 6), "GM");
  console.log(`Tx hash: ${tx.hash}`);

  await tx.wait();
  console.log("Live ads performed");
});

task("task:addVideo", "Add video to Streamfund").setAction(async function (taskArguments: TaskArguments, { ethers }) {
  const signers = await ethers.getSigners();
  const streamfundAddress = "0x63B02bDcA6e209ff0A8dab2E3B244820aE8013f1";

  const streamfund = (await ethers.getContractAt("Streamfund", streamfundAddress)) as Streamfund;
  const tx = await streamfund.connect(signers[0]).addVideo("https://video.com/1.mp4", "https://thumbnail.com/1.jpg", 2);
  console.log(`Tx hash: ${tx.hash}`);

  await tx.wait();
  console.log("Video added");
});

task("task:removeVideo", "Remove video from Streamfund").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const signers = await ethers.getSigners();
  const streamfundAddress = "0x63B02bDcA6e209ff0A8dab2E3B244820aE8013f1";
  const videoId = "0x15B99385560E0C112DA847CD24AB34CC6FA6A5F5213D084617362629CB292FD9";

  const streamfund = (await ethers.getContractAt("Streamfund", streamfundAddress)) as Streamfund;
  const tx = await streamfund.connect(signers[0]).removeVideo(videoId);
  console.log(`Tx hash: ${tx.hash}`);

  await tx.wait();
  console.log("Video removed");
});

task("task:register", "Register as streamer").setAction(async function (taskArguments: TaskArguments, { ethers }) {
  const signers = await ethers.getSigners();
  const streamfundAddress = "0x63B02bDcA6e209ff0A8dab2E3B244820aE8013f1";

  console.log("Registering as streamer...");
  const streamfund = (await ethers.getContractAt("Streamfund", streamfundAddress)) as Streamfund;
  const tx = await streamfund.connect(signers[0]).registerAsStreamer();
  console.log(`Tx hash: ${tx.hash}`);

  await tx.wait();
  console.log("Registered as streamer");
});
