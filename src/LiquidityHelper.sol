// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.13;
import "../interfaces/IERC20.sol";
import "../interfaces/IUniswapV2Router01.sol";
import "../interfaces/ILIquidityHelper.sol";
import "./Ownable.sol";

contract LiquidityHelper is Ownable, ILiquidityHelper {
    error LengthMismatch();
    IUniswapV2Router01 router;
    IUniswapV2Router01 gaxRouter;
    address GHST;
    address multisig;
    //0--fud
    //1--fomo
    //2--alpha
    //3--kek
    address[4] alchemicaTokens;

    constructor(
        address[4] memory _alchemicaTokens,
        address[4] memory _pairAddresses,
        address _quickswapRouter,
        address _ghst,
        address _multisig
    ) {
        //approve ghst
        IERC20(_ghst).approve(_quickswapRouter, type(uint256).max);
        //approve alchemica infinitely
        for (uint256 i; i < _alchemicaTokens.length; i++) {
            require(
                IERC20(_alchemicaTokens[i]).approve(
                    _quickswapRouter,
                    type(uint256).max
                )
            );
        }
        //approve pair Tokens
        for (uint256 i; i < _pairAddresses.length; i++) {
            require(
                IERC20(_pairAddresses[i]).approve(
                    _quickswapRouter,
                    type(uint256).max
                )
            );
        }

        router = IUniswapV2Router01(_quickswapRouter);
        alchemicaTokens = _alchemicaTokens;
        GHST = _ghst;
        multisig = _multisig;
    }

    function _transferOut(address _token, uint256 _amount) internal {
        require(IERC20(_token).transfer(multisig, _amount));
    }

    function transferOutTokens(
        address[] calldata _tokens,
        uint256[] calldata _amounts
    ) external onlyOwner {
        if (_tokens.length != _amounts.length) revert LengthMismatch();
        for (uint256 i; i < _tokens.length; i++) {
            _transferOut(_tokens[i], _amounts[i]);
        }
    }

    //Add liquidity to quickswap
    //tokenA is always $GHST
    function _addLiquidityQuickswap(
        address _tokenB,
        uint256 _ghstAmount,
        uint256 _amountBDesired,
        uint256 _ghstMin,
        uint256 _amountBMin
    ) internal {
        //approve amount to spend
        router.addLiquidity(
            GHST,
            _tokenB,
            _ghstAmount,
            _amountBDesired,
            _ghstMin,
            _amountBMin,
            address(this),
            block.timestamp + 3000
        );
    }

    function _addLiquidityGAX(
        address _tokenB,
        uint256 _ghstAmount,
        uint256 _amountBDesired,
        uint256 _ghstMin,
        uint256 _amountBMin
    ) internal {
        //approve amount to spend
        gaxRouter.addLiquidity(
            GHST,
            _tokenB,
            _ghstAmount,
            _amountBDesired,
            _ghstMin,
            _amountBMin,
            address(this),
            block.timestamp + 3000
        );
    }

    function _removeLiquidityGAX(
        address _tokenB,
        uint256 _liquidity,
        uint256 _ghstMin,
        uint256 _amountBMin
    ) internal {
        gaxRouter.removeLiquidity(
            GHST,
            _tokenB,
            _liquidity,
            _ghstMin,
            _amountBMin,
            address(this),
            block.timestamp + 3000
        );
    }

    function _removeLiquidityQuickswap(
        address _tokenB,
        uint256 _liquidity,
        uint256 _ghstMin,
        uint256 _amountBMin
    ) internal {
        router.removeLiquidity(
            GHST,
            _tokenB,
            _liquidity,
            _ghstMin,
            _amountBMin,
            address(this),
            block.timestamp + 3000
        );
    }

    //_legacy =true ==quickswap
    //_legacy =false== GAX
    function addLiquidity(AddLiquidityArgs calldata _args) public onlyOwner {
        if (_args._legacy) {
            _addLiquidityQuickswap(
                _args._tokenB,
                _args._ghstAmount,
                _args._amountBDesired,
                _args._ghstMin,
                _args._amountBMin
            );
        } else {
            _addLiquidityGAX(
                _args._tokenB,
                _args._ghstAmount,
                _args._amountBDesired,
                _args._ghstMin,
                _args._amountBMin
            );
        }
    }

    function withdrawLiquidity(RemoveLiquidityArgs calldata _args)
        public
        onlyOwner
    {
        if (_args._legacy) {
            _removeLiquidityQuickswap(
                _args._tokenB,
                _args._liquidity,
                _args._ghstMin,
                _args._amountBMin
            );
        } else {
            _removeLiquidityGAX(
                _args._tokenB,
                _args._liquidity,
                _args._ghstMin,
                _args._amountBMin
            );
        }
    }

    function batchAddLiquidity(AddLiquidityArgs[] calldata _args) external {
        for (uint256 i; i < _args.length; i++) {
            addLiquidity(_args[i]);
        }
    }

    function batchRemoveLiquidity(RemoveLiquidityArgs[] calldata _args)
        external
    {
        for (uint256 i; i < _args.length; i++) {
            withdrawLiquidity(_args[i]);
        }
    }

    function setGAXRouter(address _routerAddress) public onlyOwner {
        gaxRouter = IUniswapV2Router01(_routerAddress);
    }
}
