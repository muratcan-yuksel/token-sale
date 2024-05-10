const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

let token, owner, user1, tokenSale, tokenSaleAddress;

beforeEach(async function () {
  // Deploy AWToken contract
  const Token = await ethers.getContractFactory("AWToken");
  token = await Token.deploy();
  // console.log("Token address:", await token.getAddress());
  const tokenAddress = await token.getAddress();

  // Deploy TokenSale contract
  const TokenSale = await ethers.getContractFactory("TokenSale");
  tokenSale = await TokenSale.deploy(tokenAddress, 5);
  console.log("tokenSale address:", await tokenSale.getAddress());
  tokenSaleAddress = await tokenSale.getAddress();

  // Get signers
  [owner, user1] = await ethers.getSigners();
});
