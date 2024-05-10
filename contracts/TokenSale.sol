// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract TokenSale is Ownable, ReentrancyGuard {
    IERC20 public awtoken;

    uint256 public tokenPrice;
    uint256 public tokenSold;
    //max amount of tokens that can be bought by an address
    uint8 public maxSale;
    uint8 public minSale;

    mapping(address => uint256) public balances;
    mapping(address => bool) public whitelistedAddresses;

    bool public saleActive = true;
    //events
    event TokenSold(address indexed buyer, uint256 amount, uint256 valueInUSDT);

    constructor(IERC20 _awtoken, uint256 _tokenPrice) Ownable(msg.sender) {
        awtoken = _awtoken;
        tokenPrice = _tokenPrice;
        tokenSold = 0;
        maxSale = 3;
        minSale = 1;
    }

    function setSaleLimits(uint8 _maxSale, uint8 _minSale) external onlyOwner {
        maxSale = _maxSale;
        minSale = _minSale;
    }
}
