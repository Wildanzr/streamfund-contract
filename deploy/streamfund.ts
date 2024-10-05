import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const streamfund = await deploy("Streamfund", {
    from: deployer,
    args: [],
    log: true,
  });

  console.log(`Streamfund contract: `, streamfund.address);
  console.log(`Verify now: bunx hardhat verify ${streamfund.address}`);
};

export default func;
func.id = "streamfund";
func.tags = ["Streamfund"];
