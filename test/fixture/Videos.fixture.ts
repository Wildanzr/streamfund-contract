import { ethers } from "hardhat";

import type { Videos, Videos__factory } from "../../types";

export async function deployVideosFixture() {
  // Get signers
  const signers = await ethers.getSigners();
  const owner = signers[0];
  const accounts = signers.slice(2);

  const Videos = (await ethers.getContractFactory("Videos")) as Videos__factory;
  const videos = (await Videos.deploy()) as Videos;
  const videoManagement_address = await videos.getAddress();

  return { videos, videoManagement_address, owner, accounts };
}
