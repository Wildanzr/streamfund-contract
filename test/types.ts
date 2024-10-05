import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/dist/src/signer-with-address";

import type { Streamfund, Tokens } from "../types";

type Fixture<T> = () => Promise<T>;

declare module "mocha" {
  export interface Context {
    // Contracts
    streamfund: Streamfund;
    tokens: Tokens;
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    signers: Signers;

    // Variables
    owner: SignerWithAddress;
    editor: SignerWithAddress;
    accounts: SignerWithAddress[];
  }
}

export interface Signers {
  admin: SignerWithAddress;
}
