const hre = require("hardhat");

async function main() {
  const VeriStake = await hre.ethers.getContractFactory("VeriStake");
  console.log("Deploying VeriStake...");
  const veriStake = await VeriStake.deploy();
  await veriStake.waitForDeployment();
  console.log("VeriStake deployed to:", await veriStake.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
