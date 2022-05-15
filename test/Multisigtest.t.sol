// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.13;

import "../lib/ds-test.git/src/cheat.sol";
import "../lib/ds-test.git/src/test.sol";
import "../contracts/LiquidityHelper.sol";
import "../interfaces/IERC20.sol";
import "../interfaces/ILiquidityHelper.sol";

interface Multisig {
    function submitTransaction(
        address destination,
        uint value,
        bytes memory data
    ) external returns (uint transactionId);

    function approve(address spender, uint amount)
        external
        returns (bool success);

    function confirmTransaction(uint256 transactionId) external;

    function balanceOf(address account) external view returns (uint256);

    function transfer(address to, uint256 amount)
        external
        returns (bool success);
}

contract MultisigTests is DSTest {
    struct AddLiquidityArgs {
        address _tokenA;
        address _tokenB;
        uint256 _amountADesired;
        uint256 _amountBDesired;
        uint256 _amountAMin;
        uint256 _amountBMin;
        // bool _legacy;
    }

    Vm cheat = Vm(HEVM_ADDRESS);
    Multisig mSig;
    LiquidityHelper help;

    address[3] admins = [
        0x365Bc7A7B4D8Fe5d45F77aD67BC5bD4F9a748C20,
        0x02491D37984764d39b99e4077649dcD349221a62,
        0x585E06CA576D0565a035301819FD2cfD7104c1E8
    ];
    address helper = 0x888C1DDFCDF52993E84cf00A962354063a08A6b9;
    address multisig = 0xD4151c984e6CF33E04FFAAF06c3374B2926Ecc64;
    address[4] alchemica = [
        0x403E967b044d4Be25170310157cB1A4Bf10bdD0f,
        0x44A6e0BE76e1D9620A7F76588e4509fE4fa8E8C8,
        0x6a3E7C3c6EF65Ee26975b12293cA1AAD7e1dAeD2,
        0x42E5E06EF5b90Fe15F853F59299Fc96259209c5C
    ];
    address fudGHST = 0xfEC232CC6F0F3aEb2f81B2787A9bc9F6fc72EA5C;
    address GHST = 0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7;

    function setUp() public {
        mSig = Multisig(multisig);

        //transfer ownership to multisig
        help = LiquidityHelper(helper);
        cheat.prank(0xC3c2e1Cf099Bc6e1fA94ce358562BCbD5cc59FE5);
        help.transferOwnership(multisig);
    }

    function testMultisigTokensOut() public {
        //transfer fud and ghst to helper
        bytes memory tr = abi.encodeWithSelector(
            Multisig.transfer.selector,
            helper,
            100e18
        );
        cheat.startPrank(admins[0]);
        uint txID = mSig.submitTransaction(alchemica[0], 0, tr);
        uint txID2 = mSig.submitTransaction(GHST, 0, tr);
        cheat.stopPrank();

        cheat.startPrank(admins[1]);
        mSig.confirmTransaction(txID);
        mSig.confirmTransaction(txID2);
        cheat.stopPrank();

        //confirm helper balance
        assertEq(Multisig(alchemica[0]).balanceOf(helper), 100e18);
        assertEq(Multisig(GHST).balanceOf(helper), 100e18);

        //construct liquidity calldata
        AddLiquidityArgs[] memory args = new AddLiquidityArgs[](1);
        args[0] = AddLiquidityArgs(GHST, alchemica[0], 100e18, 100e18, 0, 0);
        bytes memory tr2 = abi.encodeWithSelector(
            LiquidityHelper.batchAddLiquidity.selector,
            args
        );
        cheat.startPrank(admins[0]);
        uint txID3 = mSig.submitTransaction(helper, 0, tr2);
        cheat.stopPrank();
        cheat.prank(admins[1]);
        mSig.confirmTransaction(txID3);
        emit log_uint(IERC20(fudGHST).balanceOf(helper));
        emit log_uint(IERC20(GHST).balanceOf(helper));
        emit log_uint(IERC20(alchemica[0]).balanceOf(helper));
    }
}
