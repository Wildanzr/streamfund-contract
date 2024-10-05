import { ethers } from "hardhat";

import type { Tokens, Tokens__factory } from "../../types";

export async function deployTokensFixture() {
  // Get signers
  const signers = await ethers.getSigners();
  const owner = signers[0];
  const editor = signers[1];
  const accounts = signers.slice(2);

  const Tokens = (await ethers.getContractFactory("Tokens")) as Tokens__factory;
  const tokens = (await Tokens.deploy()) as Tokens;
  const tokenManagement_address = await tokens.getAddress();

  return { tokens, tokenManagement_address, owner, editor, accounts };
}
