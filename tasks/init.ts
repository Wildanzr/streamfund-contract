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
  const streamfundAddress = "0x538E2488c3189A9dd068523cbB94d1d4d0805456";

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
  const streamfundAddress = "0x538E2488c3189A9dd068523cbB94d1d4d0805456";

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
  const streamfundAddress = "0x538E2488c3189A9dd068523cbB94d1d4d0805456";

  const streamer = "0x20047D546F34DC8A58F8DA13fa22143B4fC5404a";
  const amount = parseEther("0.001");
  console.log(`Supporting ${streamer} with ${amount}`);
  const streamfund = (await ethers.getContractAt("Streamfund", streamfundAddress)) as Streamfund;
  const tx = await streamfund.connect(signers[0]).supportWithETH(streamer, "GM", { value: amount });
  console.log(`Tx hash: ${tx.hash}`);
});
