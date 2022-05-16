import { ethers, run } from 'hardhat'
import { convertAddLiquidityArgsToString } from '../tasks/addLiquidity'
import { AddLiquidityArgsStruct } from '../typechain-types/LiquidityHelper'
import {
  AddLiquidityTaskArgs,
  alchemicas,
  GHST,
  multisigAddress,
  transferTokenInTaskArgs,
} from './libs/liqParamHelpers'

export async function transferInTokens() {
  const payload: transferTokenInTaskArgs = {
    multisig: multisigAddress,
    tokenAddress: alchemicas[0],
    amount: ethers.utils.parseEther('100').toString(),
  }

  await run('transferInTokens', payload)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  transferInTokens()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
