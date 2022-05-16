import { BigNumber } from 'ethers'
import { ethers, run } from 'hardhat'
import { convertArrayToString } from '../tasks/transferOutTokens'
import {
  alchemicas,
  multisigAddress,
  transferTokenOutTaskArgs,
} from './libs/liqParamHelpers'

export async function transferOutTokensFromHelper() {
  const amounts = new Array(4).fill(ethers.utils.parseEther('100').toString())

  const payload: transferTokenOutTaskArgs = {
    multisig: multisigAddress,
    tokenAddresses: convertArrayToString(alchemicas),
    amounts: convertArrayToString(amounts),
    useMultisig: false,
  }

  await run('transferOutTokens', payload)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  transferOutTokensFromHelper()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
