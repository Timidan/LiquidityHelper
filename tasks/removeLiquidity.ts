import { task } from 'hardhat/config'

import { LedgerSigner } from '@ethersproject/hardware-wallets'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { PopulatedTransaction, Signer } from 'ethers'
import {
  HelperAddress,
  RemoveLiquidityTaskArgs,
} from '../scripts/libs/liqParamHelpers'
import { LiquidityHelper } from '../typechain-types/LiquidityHelper'
import { sendToMultisig } from '../scripts/libs/multisig'

task('removeLiquidity', 'Removes liquidity from quickswap pools')
  .addParam('multisig')
  .addParam('functionArguments')
  .addFlag('useMultisig')
  .setAction(
    async (
      taskArgs: RemoveLiquidityTaskArgs,
      hre: HardhatRuntimeEnvironment,
    ) => {
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
        let tx: PopulatedTransaction = await helper.populateTransaction.batchRemoveLiquidity(
          functionArguments,
        )
        await sendToMultisig(multisig, signer, tx, hre)
      } else {
        const tx2 = await helper
          .connect(signer)
          .batchRemoveLiquidity(functionArguments)
        const tx2resolved = await tx2.wait()
        console.log('Liquidity Removed in tx', tx2resolved.transactionHash)
      }
    },
  )
