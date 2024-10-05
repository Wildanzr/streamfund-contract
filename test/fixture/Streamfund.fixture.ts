import { parseUnits } from "ethers";
import { ethers } from "hardhat";

import type {
  ERC20Mock,
  ERC20Mock__factory,
  PFMock,
  PFMock__factory,
  Streamfund,
  Streamfund__factory,
} from "../../types";

interface TokenMock {
  name: string;
  ticker: string;
  mintAmount: bigint;
  decimals: number;
}
interface PriceFeedMock {
  price: string;
  decimal: number;
}

export async function deployStreamfundFixture() {
  // Get signers
  const signers = await ethers.getSigners();
  const owner = signers[0];
  const editor = signers[1];
  const accounts = signers.slice(2);

  // Mock price feed
  const Mocker = (await ethers.getContractFactory("PFMock")) as PFMock__factory;
  const priceFeeds: PriceFeedMock[] = [
    // {
    //   price: "60000",
    //   decimal: 8,
    // },
    {
      price: "2000",
      decimal: 8,
    },
    {
      price: "1",
      decimal: 8,
    },
    // {
    //   price: "1",
    //   decimal: 8,
    // },
  ];
  const deployedPriceFeed: PFMock[] = [];
  for (const item of priceFeeds) {
    const mocker = (await Mocker.deploy(8, parseUnits(item.price, 8))) as PFMock;
    deployedPriceFeed.push(mocker);
  }

  // Mock ERC20
  const ERC20Mock = (await ethers.getContractFactory("ERC20Mock")) as ERC20Mock__factory;
  const tokens: TokenMock[] = [
    // {
    //   name: "Wrapped BTC",
    //   ticker: "WBTC",
    //   mintAmount: BigInt(0.0015 * 10 ** 8),
    //   decimals: 8,
    // },
    {
      name: "Wrapped Ether",
      ticker: "WETH",
      mintAmount: BigInt(0.04 * 10 ** 18),
      decimals: 18,
    },
    {
      name: "Dai Stablecoin",
      ticker: "DAI",
      mintAmount: BigInt(100 * 10 ** 18),
      decimals: 18,
    },
    // {
    //   name: "USDC",
    //   ticker: "USDC",
    //   mintAmount: BigInt(100 * 10 ** 6),
    //   decimals: 6,
    // },
  ];
  const deployedERC20: ERC20Mock[] = [];
  for (const item of tokens) {
    const erc20Mock = (await ERC20Mock.deploy(owner.address, item.name, item.ticker, item.mintAmount)) as ERC20Mock;
    deployedERC20.push(erc20Mock);
  }

  // Streamfund
  const Streamfund = (await ethers.getContractFactory("Streamfund")) as Streamfund__factory;
  const streamfund = (await Streamfund.deploy()) as Streamfund;

  return { streamfund, owner, editor, accounts, deployedERC20, deployedPriceFeed };
}
