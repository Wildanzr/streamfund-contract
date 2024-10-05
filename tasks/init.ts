import { parseEther } from "ethers";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { Streamfund } from "../types";

task("test:chainid", "Make sure chain id is validated properly").setAction(async function (
  taskArguments: TaskArguments,
  hre,
) {
  const { ethers, deployments } = hre;
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const deployerAddr = await signers[0].getAddress();
  const streamer = signers[1];

  const streamfund = (await deployments.deploy("Streamfund", {
    from: deployerAddr,
    args: [],
    log: true,
  })) as unknown as Streamfund;
  console.log("Streamfund contract: ", await streamfund.getAddress());

  // Add 1 streamer
  const strHash = await streamfund.connect(streamer).registerAsStreamer();
  console.log("Streamer hash: ", strHash.hash);

  // Support streamer
  const sptHash = await streamfund
    .connect(deployer)
    .supportWithETH(await streamer.getAddress(), "Keep going", { value: parseEther("0.001") });
  console.log("Support hash: ", sptHash.hash);
});
