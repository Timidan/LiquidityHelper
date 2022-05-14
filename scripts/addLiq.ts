import { ethers, run } from 'hardhat'
import { convertAddLiquidityArgsToString } from '../tasks/addLiquidity'
import { AddLiquidityArgsStruct } from '../typechain-types/LiquidityHelper'
import {
  AddLiquidityTaskArgs,
  alchemicas,
  GHST,
  multisigAddress,
} from './libs/liqParamHelpers'

const arg: AddLiquidityArgsStruct = {
  _tokenA: alchemicas[0],
  _tokenB: GHST,
  _amountADesired: ethers.utils.parseEther('100'),
  _amountBDesired: ethers.utils.parseEther('100'),
  _amountAMin: 0,
  _amountBMin: 0,
}
export async function addLiquidity() {
  const payload: AddLiquidityTaskArgs = {
    multisig: multisigAddress,
    functionArguments: convertAddLiquidityArgsToString([arg]),
    useMultisig: true,
  }

  await run('addLiquidity', payload)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  addLiquidity()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
