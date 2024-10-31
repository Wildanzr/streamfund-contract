import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/dist/src/signer-with-address";

import type { ERC20Mock, PFMock, Streamers, Streamfund, Tokens, Videos } from "../types";

type Fixture<T> = () => Promise<T>;

declare module "mocha" {
  export interface Context {
    // Contracts
    streamfund: Streamfund;
    tokens: Tokens;
    videos: Videos;
    streamers: Streamers;
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    signers: Signers;

    // Variables
    owner: SignerWithAddress;
    editor: SignerWithAddress;
    accounts: SignerWithAddress[];
    deployedERC20: ERC20Mock[];
    deployedPriceFeed: PFMock[];
  }
}

export interface Signers {
  admin: SignerWithAddress;
}
