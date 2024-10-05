import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deployStreamfund = async (hre: HardhatRuntimeEnvironment) => {
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

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // await deployLock(hre);
  await deployStreamfund(hre);
};

export default func;
func.id = "deploy_streamfund"; // id required to prevent reexecution
func.tags = ["Streamfund"];
