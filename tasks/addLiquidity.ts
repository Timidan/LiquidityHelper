import { task } from 'hardhat/config'

import { LedgerSigner } from '@anders-t/ethers-ledger'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { PopulatedTransaction, Signer } from 'ethers'
import {
  AddLiquidityTaskArgs,
  HelperAddress,
} from '../scripts/libs/liqParamHelpers'
import {
  AddLiquidityArgsStruct,
  LiquidityHelper,
} from '../typechain-types/LiquidityHelper'
import { sendToMultisig } from '../scripts/libs/multisig'
export function convertAddLiquidityArgsToString(
  args: AddLiquidityArgsStruct[],
): string {
  let output: string = ''

  args.forEach((args) => {
    output = output.concat(
      `#${args._tokenA}$$$${args._tokenB}$$$${args._amountADesired}$$$${args._amountBDesired}$$$${args._amountAMin}$$$${args._amountBMin}`,
    )
  })

  return output
}

export function convertStringToAddLiquidityArgs(args: string) {
  const argArr: string[] = args.split('#').filter((string) => {
    return string.length > 0
  })
  const output: AddLiquidityArgsStruct[] = []

  argArr.forEach((string) => {
    const liqArgs = string.split('$$$')
    output.push({
      _tokenA: liqArgs[0],
      _tokenB: liqArgs[1],
      _amountADesired: liqArgs[2],
      _amountBDesired: liqArgs[3],
      _amountAMin: liqArgs[4],
      _amountBMin: liqArgs[5],
    })
  })

  return output
}

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
      console.log('Adding Liquidity with address', await signer.getAddress())
      const helper = (await hre.ethers.getContractAt(
        'LiquidityHelper',
        HelperAddress,
      )) as LiquidityHelper
      if (useMultisig) {
        let tx: PopulatedTransaction = await helper.populateTransaction.batchAddLiquidity(
          convertStringToAddLiquidityArgs(functionArguments),
        )
        await sendToMultisig(multisig, signer, tx, hre)
      } else {
        const tx2 = await helper
          .connect(signer)
          .batchAddLiquidity(convertStringToAddLiquidityArgs(functionArguments))
        const tx2resolved = await tx2.wait()
        console.log('Liquidity Added in tx', tx2resolved.transactionHash)
      }
    },
  )
