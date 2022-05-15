import { task } from 'hardhat/config'

import { LedgerSigner } from '@anders-t/ethers-ledger'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { PopulatedTransaction, Signer } from 'ethers'
import {
  abi,
  HelperAddress,
  transferTokenInTaskArgs,
} from '../scripts/libs/liqParamHelpers'
import { sendToMultisig } from '../scripts/libs/multisig'

task(
  'transferInTokens',
  'Sends tokens from the multisig to the Helper Contract',
)
  .addParam('multisig')
  .addParam('tokenAddress')
  .addParam('amount')
  .setAction(
    async (
      taskArgs: transferTokenInTaskArgs,
      hre: HardhatRuntimeEnvironment,
    ) => {
      const multisig = taskArgs.multisig
      const tokenAddress = taskArgs.tokenAddress
      const amount = taskArgs.amount

      let signer: Signer
      if (hre.network.name == 'matic') {
        signer = new LedgerSigner(hre.ethers.provider)
      } else {
        throw Error('Wrong network')
      }
      console.log(
        'Transferring token to helper contract ',
        await signer.getAddress(),
      )
      const erc20 = await hre.ethers.getContractAt(abi, tokenAddress)

      let tx: PopulatedTransaction = await erc20.populateTransaction.transfer(
        HelperAddress,
        amount,
        { gasLimit: 800000 },
      )
      await sendToMultisig(multisig, signer, tx, hre)
    },
  )
