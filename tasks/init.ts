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
  const streamfundAddress = "0xe64557155c5c396648128b9BbF7D01883E14F428";

  const candidate: AllowedToken[] = [
    {
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      priceFeed: "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1",
      decimal: 18,
      symbol: "ETH",
    },
    {
      address: "0xc8ee6dA245b1F9f15941e770224ADfF2C960620f",
      priceFeed: "0xD1092a65338d049DB68D7Be6bD89d17a0929945e",
      decimal: 18,
      symbol: "DAI",
    },
    {
      address: "0x9d3E7f41aCA3E35AF1d6050c807b45910D1c503F",
      priceFeed: "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1",
      decimal: 18,
      symbol: "WETH",
    },

    // {
    //   address: "0xaBE8Be8F97DeC3475eb761e8B120d0F6dCeFdf89",
    //   priceFeed: "0xD1092a65338d049DB68D7Be6bD89d17a0929945e",
    //   decimal: 18,
    //   symbol: "DAI",
    // },
    // {
    //   address: "0x5E82602432D793FFD2a78a76ebdEf333645A9b79",
    //   priceFeed: "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1",
    //   decimal: 18,
    //   symbol: "WETH",
    // },
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
  const streamfundAddress = "0xe64557155c5c396648128b9BbF7D01883E14F428";

  const candidate: AllowedToken[] = [
    {
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      priceFeed: "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1",
      decimal: 18,
      symbol: "ETH",
    },
    {
      address: "0xc8ee6dA245b1F9f15941e770224ADfF2C960620f",
      priceFeed: "0xD1092a65338d049DB68D7Be6bD89d17a0929945e",
      decimal: 18,
      symbol: "DAI",
    },
    {
      address: "0x9d3E7f41aCA3E35AF1d6050c807b45910D1c503F",
      priceFeed: "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1",
      decimal: 18,
      symbol: "WETH",
    },

    // {
    //   address: "0xaBE8Be8F97DeC3475eb761e8B120d0F6dCeFdf89",
    //   priceFeed: "0xD1092a65338d049DB68D7Be6bD89d17a0929945e",
    //   decimal: 18,
    //   symbol: "DAI",
    // },
    // {
    //   address: "0x5E82602432D793FFD2a78a76ebdEf333645A9b79",
    //   priceFeed: "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1",
    //   decimal: 18,
    //   symbol: "WETH",
    // },
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
  const streamfundAddress = "0xe64557155c5c396648128b9BbF7D01883E14F428";

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
  const streamfundAddress = "0xe64557155c5c396648128b9BbF7D01883E14F428";
  const streamer = "0x53462C7a8b5ad31F0eac94C79E0c341081E4Bfb7";

  console.log("Looking for streamer ", streamer);
  const streamfund = (await ethers.getContractAt("Streamfund", streamfundAddress)) as Streamfund;
  const details = await streamfund.getStreamerDetails(streamer);
  console.log(details);
});
