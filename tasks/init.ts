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
  const streamfundAddress = "0x93d6e32824e24C195b0497381b016927bA042985";

  const candidate: AllowedToken[] = [
    {
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      priceFeed: "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1",
      decimal: 18,
      symbol: "ETH",
    },
    {
      address: "0x4D658F958EB5572a9598B538f36D74B32982b10c",
      priceFeed: "0x3ec8593F930EA45ea58c968260e6e9FF53FC934f",
      decimal: 6,
      symbol: "USDT",
    },
    {
      address: "0x6EC8457cf49A5791Cb6dE61bfF214CEfFae0a0fD",
      priceFeed: "0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165",
      decimal: 6,
      symbol: "USDC",
    },
    {
      address: "0xD13eb86Da7bbf8E96656f319d5b856B382ab5098",
      priceFeed: "0xD1092a65338d049DB68D7Be6bD89d17a0929945e",
      decimal: 18,
      symbol: "DAI",
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
  const streamfundAddress = "0x93d6e32824e24C195b0497381b016927bA042985";

  const candidate: AllowedToken[] = [
    {
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      priceFeed: "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1",
      decimal: 18,
      symbol: "ETH",
    },
    {
      address: "0xD48D9f155bEfca237B13e7EAB15425aa92AB2EcE",
      priceFeed: "0x3ec8593F930EA45ea58c968260e6e9FF53FC934f",
      decimal: 6,
      symbol: "USDT",
    },
    {
      address: "0xF1e1339E419363d6e9cEf918E040D1c077D396E8",
      priceFeed: "0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165",
      decimal: 6,
      symbol: "USDC",
    },
    {
      address: "0x2a0855d7D014c039cD67A6246F742b92bb761E0E",
      priceFeed: "0xD1092a65338d049DB68D7Be6bD89d17a0929945e",
      decimal: 18,
      symbol: "DAI",
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
  const streamfundAddress = "0x93d6e32824e24C195b0497381b016927bA042985";

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
  const streamfundAddress = "0x93d6e32824e24C195b0497381b016927bA042985";
  const streamer = "0x53462C7a8b5ad31F0eac94C79E0c341081E4Bfb7";

  console.log("Looking for streamer ", streamer);
  const streamfund = (await ethers.getContractAt("Streamfund", streamfundAddress)) as Streamfund;
  const details = await streamfund.getStreamerDetails(streamer);
  console.log(details);
});
