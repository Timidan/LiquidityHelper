interface ILiquidityHelper {
    struct AddLiquidityArgs {
        address _tokenA;
        address _tokenB;
        uint256 _amountADesired;
        uint256 _amountBDesired;
        uint256 _amountAMin;
        uint256 _amountBMin;
        bool _legacy;
    }

    struct RemoveLiquidityArgs {
        address _tokenA;
        address _tokenB;
        uint256 _liquidity;
        uint256 _amountAMin;
        uint256 _amountBMin;
        bool _legacy;
    }
}
