interface ILiquidityHelper {
    struct AddLiquidityArgs {
        address _tokenB;
        uint256 _ghstAmount;
        uint256 _amountBDesired;
        uint256 _ghstMin;
        uint256 _amountBMin;
        bool _legacy;
    }

    struct RemoveLiquidityArgs {
        address _tokenB;
        uint256 _liquidity;
        uint256 _ghstMin;
        uint256 _amountBMin;
        bool _legacy;
    }
}
