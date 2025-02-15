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

const streamfundAddress = "0x4f346f17c50270E7A3Bfc859671D24eFAab0B1aF";
const candidate: AllowedToken[] = [
  {
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    priceFeed: "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1",
    decimal: 18,
    symbol: "ETH",
  },
  // {
  //   address: "0x95cef13441be50d20ca4558cc0a27b601ac544e5",
  //   priceFeed: "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1",
  //   decimal: 18,
  //   symbol: "MANTA",
  // },
  // {
  //   address: "0xf417f5a458ec102b90352f697d6e2ac3a3d2851f",
  //   priceFeed: "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1",
  //   decimal: 6,
  //   symbol: "USDT",
  // },
  // {
  //   address: "0xb73603c5d87fa094b7314c74ace2e64d165016fb",
  //   priceFeed: "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1",
  //   decimal: 6,
  //   symbol: "USDC",
  // },
  // {
  //   address: "0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34",
  //   priceFeed: "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1",
  //   decimal: 18,
  //   symbol: "USDe",
  // },
];

task("task:add", "Add initial allowed token to Streamfund").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const signers = await ethers.getSigners();
  for (let i = 0; i < candidate.length; i++) {
    console.log(`Adding ${candidate[i].symbol} to Streamfund`);
    const streamfund = (await ethers.getContractAt("Streamfund", streamfundAddress)) as Streamfund;
    const [tx] = await Promise.all([
      streamfund
        .connect(signers[0])
        .addAllowedToken(candidate[i].address, candidate[i].priceFeed, candidate[i].decimal, candidate[i].symbol),
    ]);

    console.log(`Tx hash: ${tx.hash}`);

    await tx.wait();
    console.log("Tx mined, waiting for 30 seconds");
    await new Promise((resolve) => setTimeout(resolve, 30_000));
  }
});

task("task:remove", "Remove initial allowed token to Streamfund").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const signers = await ethers.getSigners();
  for (let i = 0; i < candidate.length; i++) {
    console.log(`Removing ${candidate[i].symbol} to Streamfund`);
    const streamfund = (await ethers.getContractAt("Streamfund", streamfundAddress)) as Streamfund;
    const [tx] = await Promise.all([streamfund.connect(signers[0]).removeAllowedToken(candidate[i].address)]);

    console.log(`Tx hash: ${tx.hash}`);

    await tx.wait();
    console.log("Tx mined, waiting for 30 seconds");
    await new Promise((resolve) => setTimeout(resolve, 30_000));
  }
});

task("task:support", "Give support to streamer").setAction(async function (taskArguments: TaskArguments, { ethers }) {
  const signers = await ethers.getSigners();

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

task("task:register", "Get streamer details").setAction(async function (taskArguments: TaskArguments, { ethers }) {
  const streamer = "0x53462C7a8b5ad31F0eac94C79E0c341081E4Bfb7";

  console.log("Looking for streamer ", streamer);
  const streamfund = (await ethers.getContractAt("Streamfund", streamfundAddress)) as Streamfund;
  const details = await streamfund.getStreamerDetails(streamer);
  console.log(details);
});
