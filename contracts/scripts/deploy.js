const hre = require("hardhat");

async function main() {
  console.log("Deploying VeriStake to Monad testnet...");

  const VeriStake = await hre.ethers.getContractFactory("VeriStake");
  const veriStake = await VeriStake.deploy();
  await veriStake.waitForDeployment();

  const address = await veriStake.getAddress();
  console.log(`VeriStake deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
