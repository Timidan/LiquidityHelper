import { ethers, run } from "hardhat";
import { convertAddLiquidityArgsToString } from "../tasks/addLiquidity";
import { convertArrayToString } from "../tasks/transferOutTokens";
import { AddLiquidityArgsStruct } from "../typechain-types/LiquidityHelper";
import {
  AddLiquidityTaskArgs,
  alchemicas,
  GHST,
  multisigAddress,
  transferTokenInTaskArgs,
  transferTokenOutTaskArgs,
} from "./libs/liqParamHelpers";

export async function transferInTokens() {
  for await (const alchemica of alchemicas) {
    const payload: transferTokenInTaskArgs = {
      multisig: multisigAddress,
      tokenAddress: alchemica,
      amount: ethers.utils.parseEther("100").toString(),
    };
    await run("transferInTokens", payload);
  }

  const amounts = new Array(4).fill(ethers.utils.parseEther("100").toString());

  const payload2: transferTokenOutTaskArgs = {
    multisig: multisigAddress,
    tokenAddresses: convertArrayToString(alchemicas),
    amounts: convertArrayToString(amounts),
    useMultisig: false,
  };

  await run("transferOutTokens", payload2);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  transferInTokens()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
