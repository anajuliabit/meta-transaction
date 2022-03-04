// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import { BICONOMY_ERC_FORWARDER } from "../constants/index";

async function main() {
  const ERC20Factory = await ethers.getContractFactory(
    "contracts/ERC20MetaTransaction.sol:ERC20MetaTransaction"
  );
  const contract = await ERC20Factory.deploy(BICONOMY_ERC_FORWARDER);

  await contract.deployed();

  console.log("ERC20 deployed to:", contract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
