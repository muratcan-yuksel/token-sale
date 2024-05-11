const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

let token,
  owner,
  tokenSale,
  tokenSaleAddress,
  user1, //NO whitelist
  user2, //whitelist
  user3,
  user4, //whitelist
  user5;

async function setupContracts() {
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
  [owner, user1, user2, user3, user4, user5] = await ethers.getSigners();

  //owner sends all of the tokens to the tokenSale contract
  await token.transfer(tokenSaleAddress, 100);
}

beforeEach(async function () {
  //call the setup function
  await setupContracts();
});

//utility functions
const addToWhitelist = async function (user) {
  await tokenSale.connect(owner).addToWhitelist(user);
};

it("whitelist sale is active as soon as the contract is deployed", async function () {
  expect(await tokenSale.isWhitelistSaleActive()).to.equal(true);
});

it("standard sale is not active", async function () {
  expect(await tokenSale.isSaleActive()).to.equal(false);
});

it("token price is 5 ETH", async function () {
  expect(await tokenSale.tokenPrice()).to.equal(5);
});

it("non whitelisted user cannot buy tokens", async function () {
  await expect(
    tokenSale.connect(user1).buyWhitesaleTokens(1)
  ).to.be.revertedWith("You are not whitelisted");
});

it("owner can whitelist users", async function () {
  await addToWhitelist(user2.address);
});
it("non owner cannot whitelist users", async function () {
  await expect(tokenSale.connect(user1).addToWhitelist(user3.address)).to.be
    .reverted;
});

it("whitelisted user can buy tokens", async function () {
  await addToWhitelist(user2.address);
  await tokenSale.connect(user2).buyWhitesaleTokens(1, { value: 5 });

  expect(await token.balanceOf(user2.address)).to.equal(1);
  expect(await tokenSale.getTokenSold()).to.equal(1);
});
