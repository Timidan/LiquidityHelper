import { task } from 'hardhat/config'

import { LedgerSigner } from '@anders-t/ethers-ledger'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { PopulatedTransaction, Signer } from 'ethers'
import {
  HelperAddress,
  transferTokenOutTaskArgs,
} from '../scripts/libs/liqParamHelpers'
import { LiquidityHelper } from '../typechain-types/LiquidityHelper'
import { sendToMultisig } from '../scripts/libs/multisig'
export function convertArrayToString(args: string[]): string {
  let output: string
  output = args.toString()
  return output
}

export function convertStringToArray(args: string) {
  const output: string[] = args.split(',')
  console.log(output)
  return output
}

task('transferOutTokens', 'Sends tokens out of the Helper Contract')
  .addParam('tokenAddresses')
  .addParam('amounts')
  .addFlag('useMultisig')
  .setAction(
    async (
      taskArgs: transferTokenOutTaskArgs,
      hre: HardhatRuntimeEnvironment,
    ) => {
      const multisig = taskArgs.multisig
      const tokenAddresses = taskArgs.tokenAddresses
      const amounts = taskArgs.amounts
      const useMultisig = taskArgs.useMultisig

      let signer: Signer
      if (hre.network.name == 'matic') {
        if (useMultisig) {
          signer = new LedgerSigner(hre.ethers.provider)
        } else {
          signer = (await hre.ethers.getSigners())[0]
        }
      } else {
        throw Error('Wrong network')
      }
      console.log('Transferring token from helper contract ')
      const helper = (await hre.ethers.getContractAt(
        'LiquidityHelper',
        HelperAddress,
      )) as LiquidityHelper

      let tx: PopulatedTransaction = await helper.populateTransaction.returnTokens(
        convertStringToArray(tokenAddresses),
        convertStringToArray(amounts),
        { gasLimit: 800000 },
      )
      await sendToMultisig(multisig, signer, tx, hre)
    },
  )
