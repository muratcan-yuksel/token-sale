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
  tokenSale = await TokenSale.deploy(tokenAddress, 5, 2);
  console.log("tokenSale address:", await tokenSale.getAddress());
  tokenSaleAddress = await tokenSale.getAddress();

  // Get signers
  [owner, user1] = await ethers.getSigners();
});

it("Has correct name and symbol", async function () {
  expect(await token.name()).to.equal("AWToken");
  expect(await token.symbol()).to.equal("AWT");
});

it("mints 100 tokens to the deployer", async function () {
  //but convert them to wei also
  const balance = await token.balanceOf(owner.address);
  expect(balance).to.equal(ethers.parseEther("100"));

  //for the user1 now
  const balance1 = await token.balanceOf(user1.address);
  expect(balance1).to.equal(0);
});
