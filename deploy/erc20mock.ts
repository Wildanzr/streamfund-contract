import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { writeToFile } from "../lib/utils";

interface TokenMock {
  name: string;
  ticker: string;
  mintAmount: bigint;
  decimals: number;
}

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const path = "args/";
  const tokens: TokenMock[] = [
    {
      name: "Dai Stablecoin",
      ticker: "DAI",
      mintAmount: BigInt(0.04 * 10 ** 18),
      decimals: 18,
    },
    // {
    //   name: "Tether USD",
    //   ticker: "USDT",
    //   mintAmount: BigInt(100 * 10 ** 18),
    //   decimals: 6,
    // },
  ];

  const deployedTokens: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = await deploy("ERC20Mock", {
      from: deployer,
      args: [deployer, tokens[i].name, tokens[i].ticker, tokens[i].mintAmount],
      log: true,
    });
    const tokenParams = `module.exports = ["${deployer}", "${tokens[i].name}", "${tokens[i].ticker}", "${tokens[i].mintAmount}"];`;
    await writeToFile(`${path}token${i}.ts`, tokenParams);
    console.log(`ERC20Mock contract ${tokens[i].ticker}: `, token.address);
    deployedTokens.push(token.address);
  }

  let verifyScript = ``;
  deployedTokens.forEach((item) => {
    verifyScript += `bunx hardhat verify --network base-sepolia --constructor-args args/token${deployedTokens.indexOf(
      item,
    )}.ts ${item} && `;
  });
  console.log(`Verify now: ${verifyScript.slice(0, -4)}`);
};

export default func;
func.id = "erc20mock";
func.tags = ["ERC20Mock"];
