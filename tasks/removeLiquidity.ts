import { task } from 'hardhat/config'

import { LedgerSigner } from '@ethersproject/hardware-wallets'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { PopulatedTransaction, Signer } from 'ethers'
import {
  HelperAddress,
  RemoveLiquidityTaskArgs,
} from '../scripts/libs/liqParamHelpers'
import {
  LiquidityHelper,
  RemoveLiquidityArgsStruct,
} from '../typechain-types/LiquidityHelper'
import { sendToMultisig } from '../scripts/libs/multisig'

export function convertRemoveLiquidityArgsToString(
  args: RemoveLiquidityArgsStruct[],
): string {
  let output: string = ''

  args.forEach((args) => {
    output = output.concat(
      `#${args._tokenA}$$$${args._tokenB}$$$${args._liquidity}$$$${args._amountAMin}$$$${args._amountBMin}`,
    )
  })

  return output
}

export function convertStringToRemoveLiquidityArgs(args: string) {
  const argArr: string[] = args.split('#').filter((string) => {
    return string.length > 0
  })
  const output: RemoveLiquidityArgsStruct[] = []

  argArr.forEach((string) => {
    const liqArgs = string.split('$$$')
    output.push({
      _tokenA: liqArgs[0],
      _tokenB: liqArgs[1],
      _liquidity: liqArgs[2],
      _amountAMin: liqArgs[3],
      _amountBMin: liqArgs[4],
    })
  })
  return output
}

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
      } else if (
        hre.network.name == 'localhost' ||
        hre.network.name == 'hardhat'
      ) {
        signer = await hre.ethers.getSigner(
          '0x365Bc7A7B4D8Fe5d45F77aD67BC5bD4F9a748C20',
        )
        await hre.network.provider.request({
          method: 'hardhat_impersonateAccount',
          params: ['0x365Bc7A7B4D8Fe5d45F77aD67BC5bD4F9a748C20'],
        })
      } else {
        throw Error('Wrong network')
      }
      console.log('Removing Liquidity with address', await signer.getAddress())
      const helper = (await hre.ethers.getContractAt(
        'LiquidityHelper',
        HelperAddress,
      )) as LiquidityHelper
      if (useMultisig) {
        let tx: PopulatedTransaction = await helper.populateTransaction.batchRemoveLiquidity(
          convertStringToRemoveLiquidityArgs(functionArguments),
        )
        await sendToMultisig(multisig, signer, tx, hre)
      } else {
        const tx2 = await helper
          .connect(signer)
          .batchRemoveLiquidity(
            convertStringToRemoveLiquidityArgs(functionArguments),
          )
        const tx2resolved = await tx2.wait()
        console.log('Liquidity Removed in tx', tx2resolved.transactionHash)
      }
    },
  )
