import { ethers } from "hardhat";

import type { Streamers, Streamers__factory } from "../../types";

export async function deployStreamersFixture() {
  // Get signers
  const signers = await ethers.getSigners();
  const owner = signers[0];
  const editor = signers[1];
  const accounts = signers.slice(2);

  const Streamers = (await ethers.getContractFactory("Streamers")) as Streamers__factory;
  const streamers = (await Streamers.deploy()) as Streamers;
  const streamers_address = await streamers.getAddress();

  return { streamers, streamers_address, owner, editor, accounts };
}
