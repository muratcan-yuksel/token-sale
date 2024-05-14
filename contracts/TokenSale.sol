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

    bool public saleActive = false;
    bool public whitelistSaleActive = true;
    bool public paused = false;
    //events
    event TokenSold(address indexed buyer, uint256 amount, uint256 valueInUSDT);

    constructor(IERC20 _awtoken, uint256 _tokenPrice) Ownable(msg.sender) {
        awtoken = _awtoken;
        tokenPrice = _tokenPrice;
        tokenSold = 0;
        maxSale = 3;
        minSale = 1;
    }

    //view functions

    function isWhitelisted(address _address) public view returns (bool) {
        return whitelistedAddresses[_address];
    }

    function isSaleActive() public view returns (bool) {
        return saleActive;
    }

    function isWhitelistSaleActive() public view returns (bool) {
        return whitelistSaleActive;
    }

    function getTokenPrice() public view returns (uint256) {
        return tokenPrice;
    }

    function getTokenSold() public view returns (uint256) {
        return tokenSold;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getMaxSale() public view returns (uint8) {
        return maxSale;
    }

    function getMinSale() public view returns (uint8) {
        return minSale;
    }

    function getPaused() public view returns (bool) {
        return paused;
    }

    function getOwner() public view returns (address) {
        return owner();
    }

    //write functions
    function setSaleLimits(uint8 _maxSale, uint8 _minSale) external onlyOwner {
        maxSale = _maxSale;
        minSale = _minSale;
    }

    function toggleWhitelistSaleActive() external onlyOwner {
        whitelistSaleActive = !whitelistSaleActive;
    }

    function toggleSaleActive() external onlyOwner {
        saleActive = !saleActive;
    }

    function addToWhitelist(address _address) external onlyOwner {
        whitelistedAddresses[_address] = true;
        // emit AddedToWhitelist(_address);
    }

    function removeFromWhitelist(address _address) external onlyOwner {
        delete whitelistedAddresses[_address];
        // emit RemovedFromWhitelist(_address);
        // or we can do
        //whitelistedAddresses[_address] = false;
    }

    function togglePause() external onlyOwner {
        paused = !paused;
    }

    function setTokenPrice(uint256 _tokenPrice) external onlyOwner {
        tokenPrice = _tokenPrice;
    }

    function buyWhitesaleTokens(uint256 _amount) external payable nonReentrant {
        require(whitelistSaleActive, "WhiteSale is not active");
        require(paused == false, "Contract is paused");
        require(
            saleActive == false,
            "Standard should be inactive during the whitesale"
        );
        require(whitelistedAddresses[msg.sender], "You are not whitelisted");
        require(
            _amount >= minSale && _amount <= maxSale,
            "Amount must be between 1 and 3"
        );
        require(
            msg.value >= _amount * tokenPrice,
            "You have to pay the correct amount"
        );
        require(
            address(this).balance >= _amount * tokenPrice,
            "Not enough ETH"
        );
        require(
            balances[msg.sender] + _amount <= maxSale,
            "You cannot buy more than the specified max tokens"
        );

        awtoken.transfer(msg.sender, _amount);
        balances[msg.sender] += _amount;
        tokenSold += _amount;
        //emit TokenSold(msg.sender, _amount, _amount * tokenPrice);
    }

    function buyTokens(uint256 _amount) external payable nonReentrant {
        require(saleActive, "Standard sale is not active");
        require(paused == false, "Contract is paused");
        require(whitelistSaleActive == false, "WhiteSale should not be active");
        require(
            _amount >= minSale && _amount <= maxSale,
            "Amount must be between 1 and 3"
        );
        require(
            msg.value >= _amount * tokenPrice,
            "You have to pay the correct amount"
        );
        require(
            address(this).balance >= _amount * tokenPrice,
            "Not enough ETH"
        );
        require(
            balances[msg.sender] + _amount <= maxSale,
            "You cannot buy more than the specified max tokens"
        );

        awtoken.transfer(msg.sender, _amount);
        balances[msg.sender] += _amount;

        tokenSold += _amount;
        //emit TokenSold(msg.sender, _amount, _amount * tokenPrice);
    }

    function withdrawEth() external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    function withdrawToken() external onlyOwner {
        awtoken.transfer(msg.sender, address(this).balance);
    }

    fallback() external payable {
        payable(msg.sender).transfer(address(this).balance);
    }

    receive() external payable {
        payable(msg.sender).transfer(address(this).balance);
    }
}
