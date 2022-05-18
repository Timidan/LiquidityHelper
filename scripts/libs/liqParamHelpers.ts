import { BigNumber } from "ethers";
import {
  AddLiquidityArgsStruct,
  RemoveLiquidityArgsStruct,
} from "../../typechain-types/LiquidityHelper";

export const HelperAddress = "0x226D0d6A672108626717aF443B076AC23B0bb580";
export const multisigAddress = "0xD4151c984e6CF33E04FFAAF06c3374B2926Ecc64";
export const alchemicas = [
  "0x403E967b044d4Be25170310157cB1A4Bf10bdD0f",
  "0x44A6e0BE76e1D9620A7F76588e4509fE4fa8E8C8",
  "0x6a3E7C3c6EF65Ee26975b12293cA1AAD7e1dAeD2",
  "0x42E5E06EF5b90Fe15F853F59299Fc96259209c5C",
];
export const GHST = "0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7";

export interface AddLiquidityTaskArgs {
  multisig: string;
  functionArguments: string;
  useMultisig: boolean;
}

export interface RemoveLiquidityTaskArgs {
  multisig: string;
  functionArguments: string;
  useMultisig: boolean;
}

export interface transferTokenInTaskArgs {
  multisig: string;
  tokenAddress: string;
  amount: string | BigNumber;
}

export interface transferTokenOutTaskArgs {
  multisig: string;
  tokenAddresses: string;
  amounts: string;
  useMultisig: boolean;
}
export const abi = [
  "function submitTransaction(address destination, uint value, bytes data) public returns (uint transactionId)",
  "function transfer(address recipient,uint256 amount) public returns(bool success)",
];
