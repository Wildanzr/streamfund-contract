import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { Streamfund } from "../types";

interface AllowedToken {
  address: string;
  priceFeed: string;
  decimal: number;
  symbol: string;
}

task("task:allowedtoken", "Add initial allowed token to Streamfund").setAction(async function (
  taskArguments: TaskArguments,
  { ethers },
) {
  const signers = await ethers.getSigners();
  const streamfundAddress = "0x2530068079c3DE7833410675DaA301b110eBFDF4";

  const candidate: AllowedToken[] = [
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
