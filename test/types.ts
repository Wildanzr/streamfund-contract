import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/dist/src/signer-with-address";

import type { ERC20Mock, PFMock, PFTest, Streamers, Streamfund, Tokens, Videos } from "../types";

type Fixture<T> = () => Promise<T>;

interface PriceFeedMock {
  price: string;
  decimal: number;
}

declare module "mocha" {
  export interface Context {
    // Contracts
    streamfund: Streamfund;
    tokens: Tokens;
    videos: Videos;
    streamers: Streamers;
    pfTest: PFTest;
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    signers: Signers;

    // Variables
    owner: SignerWithAddress;
    editor: SignerWithAddress;
    accounts: SignerWithAddress[];
    deployedERC20: ERC20Mock[];
    deployedPriceFeed: PFMock[];
    priceFeeds: PriceFeedMock[];
  }
}

export interface Signers {
  admin: SignerWithAddress;
}
