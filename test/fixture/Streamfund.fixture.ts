import { parseUnits } from "ethers";
import { ethers } from "hardhat";

import type { PFMock, PFMock__factory, Streamfund, Streamfund__factory } from "../../types";

export async function deployStreamfundFixture() {
  // Get signers
  const signers = await ethers.getSigners();
  const owner = signers[0];
  const editor = signers[1];
  const accounts = signers.slice(2);

  // Mock price feed
  const Mocker = (await ethers.getContractFactory("PFMock")) as PFMock__factory;
  const ethPriceFeed = (await Mocker.deploy(8, parseUnits("2000", 8))) as PFMock;
  const btcPriceFeed = (await Mocker.deploy(8, parseUnits("60000", 8))) as PFMock;
  const usdtPriceFeed = (await Mocker.deploy(8, parseUnits("1", 8))) as PFMock;

  const ethPriceFeed_address = await ethPriceFeed.getAddress();
  const btcPriceFeed_address = await btcPriceFeed.getAddress();
  const usdtPriceFeed_address = await usdtPriceFeed.getAddress();

  // Streamfund
  const Streamfund = (await ethers.getContractFactory("Streamfund")) as Streamfund__factory;
  const streamfund = (await Streamfund.deploy()) as Streamfund;
  const streamfund_address = await streamfund.getAddress();

  return { streamfund, streamfund_address, owner, editor, accounts };
}
