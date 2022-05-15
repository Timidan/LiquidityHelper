import { ethers, run } from 'hardhat'
import { convertRemoveLiquidityArgsToString } from '../tasks/removeLiquidity'
import { RemoveLiquidityArgsStruct } from '../typechain-types/LiquidityHelper'
import {
  RemoveLiquidityTaskArgs,
  alchemicas,
  GHST,
  multisigAddress,
} from './libs/liqParamHelpers'

const arg: RemoveLiquidityArgsStruct = {
  _tokenA: alchemicas[0],
  _tokenB: GHST,
  _liquidity: ethers.utils.parseEther('1'),
  _amountAMin: 0,
  _amountBMin: 0,
}
export async function removeLiquidity() {
  const payload: RemoveLiquidityTaskArgs = {
    multisig: multisigAddress,
    functionArguments: convertRemoveLiquidityArgsToString([arg]),
    useMultisig: false,
  }

  await run('removeLiquidity', payload)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  removeLiquidity()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
