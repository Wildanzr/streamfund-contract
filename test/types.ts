import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/dist/src/signer-with-address";

import type { Streamfund, TokenManagement } from "../types";

type Fixture<T> = () => Promise<T>;

declare module "mocha" {
  export interface Context {
    // Contracts
    streamfund: Streamfund;
    tokenManagement: TokenManagement;
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
