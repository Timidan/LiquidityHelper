import { task } from 'hardhat/config'

import { LedgerSigner } from '@ethersproject/hardware-wallets'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { PopulatedTransaction, Signer } from 'ethers'
import {
  AddLiquidityTaskArgs,
  HelperAddress,
} from '../scripts/libs/liqParamHelpers'
import { LiquidityHelper } from '../typechain-types/LiquidityHelper'
import { sendToMultisig } from '../scripts/libs/multisig'

task('addLiquidity', 'Adds liquidity to quickswap pools')
  .addParam('multisig')
  .addParam('functionArguments')
  .addFlag('useMultisig')
  .setAction(
    async (taskArgs: AddLiquidityTaskArgs, hre: HardhatRuntimeEnvironment) => {
      const multisig = taskArgs.multisig
      const functionArguments = taskArgs.functionArguments
      const useMultisig = taskArgs.useMultisig

      let signer: Signer
      let tx
      if (hre.network.name == 'matic') {
        if (useMultisig) {
          signer = new LedgerSigner(hre.ethers.provider)
        } else signer = (await hre.ethers.getSigners())[0]
      } else {
        throw Error('Wrong network')
      }
      console.log('Adding Liquidity with address', signer.getAddress())
      const helper = (await hre.ethers.getContractAt(
        'Liquidityhelper',
        HelperAddress,
      )) as LiquidityHelper
      if (useMultisig) {
        let tx: PopulatedTransaction = await helper.populateTransaction.batchAddLiquidity(
          functionArguments,
        )
        await sendToMultisig(multisig, signer, tx, hre)
      } else {
        const tx2 = await helper
          .connect(signer)
          .batchAddLiquidity(functionArguments)
        const tx2resolved = await tx2.wait()
        console.log('Liquidity Added in tx', tx2resolved.transactionHash)
      }
    },
  )
