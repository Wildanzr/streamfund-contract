import { ethers } from "hardhat";

import type { TokenManagement, TokenManagement__factory } from "../../types";

export async function deployTokenManagementFixture() {
  // Get signers
  const signers = await ethers.getSigners();
  const owner = signers[0];
  const editor = signers[1];
  const accounts = signers.slice(2);

  const TokenManagement = (await ethers.getContractFactory("TokenManagement")) as TokenManagement__factory;
  const tokenManagement = (await TokenManagement.deploy()) as TokenManagement;
  const tokenManagement_address = await tokenManagement.getAddress();

  return { tokenManagement, tokenManagement_address, owner, editor, accounts };
}
