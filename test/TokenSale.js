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
  tokenSale = await TokenSale.deploy(
    tokenAddress,
    ethers.parseUnits("5", "ether")
  );
  console.log("tokenSale address:", await tokenSale.getAddress());
  tokenSaleAddress = await tokenSale.getAddress();

  // Get signers
  [owner, user1, user2, user3, user4, user5] = await ethers.getSigners();

  //!owner sends all of the tokens to the tokenSale contract
  await token.transfer(tokenSaleAddress, 100);
  // *
  // ?
  // TODO
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
  expect(await tokenSale.tokenPrice()).to.equal(
    ethers.parseUnits("5", "ether")
  );
});

it("non whitelisted user cannot buy tokens", async function () {
  await expect(
    tokenSale.connect(user1).buyWhitesaleTokens(1)
  ).to.be.revertedWith("You are not whitelisted");
});

it("owner can whitelist users", async function () {
  await addToWhitelist(user2.address);
  expect(await tokenSale.isWhitelisted(user2.address)).to.equal(true);
});

it("owner can whitelist multiple users", async function () {
  await addToWhitelist(user3.address);
  await addToWhitelist(user4.address);
  expect(await tokenSale.isWhitelisted(user3.address)).to.equal(true);
  expect(await tokenSale.isWhitelisted(user4.address)).to.equal(true);
});

it("non owner cannot whitelist users", async function () {
  await expect(tokenSale.connect(user1).addToWhitelist(user3.address)).to.be
    .reverted;
});

it("whitelisted users can buy tokens", async function () {
  await addToWhitelist(user2.address);
  await tokenSale
    .connect(user2)
    .buyWhitesaleTokens(1, { value: ethers.parseUnits("5", "ether") });

  expect(await token.balanceOf(user2.address)).to.equal(1);
  expect(await tokenSale.getTokenSold()).to.equal(1);
  expect(await tokenSale.getBalance()).to.equal(
    ethers.parseUnits("5", "ether")
  );
});

it("multiple whitelisted users can buy tokens", async function () {
  await addToWhitelist(user3.address);
  await addToWhitelist(user4.address);
  await tokenSale
    .connect(user3)
    .buyWhitesaleTokens(1, { value: ethers.parseUnits("5", "ether") });
  await tokenSale
    .connect(user4)
    .buyWhitesaleTokens(1, { value: ethers.parseUnits("5", "ether") });

  expect(await token.balanceOf(user3.address)).to.equal(1);
  expect(await token.balanceOf(user4.address)).to.equal(1);
  expect(await tokenSale.getTokenSold()).to.equal(2);
  expect(await tokenSale.getBalance()).to.equal(
    ethers.parseUnits("10", "ether")
  );
});

it("a whitelisted user can make multiple transactions until they reach the max sale limit", async function () {
  await addToWhitelist(user2.address);
  await tokenSale
    .connect(user2)
    .buyWhitesaleTokens(1, { value: ethers.parseUnits("5", "ether") });

  expect(await token.balanceOf(user2.address)).to.equal(1);
  expect(await tokenSale.getTokenSold()).to.equal(1);
  expect(await tokenSale.getBalance()).to.equal(
    ethers.parseUnits("5", "ether")
  );
  //wait for one block
  await ethers.provider.send("evm_mine", []);
  //buy 2 more tokens
  await tokenSale
    .connect(user2)
    .buyWhitesaleTokens(2, { value: ethers.parseUnits("10", "ether") });
  expect(await token.balanceOf(user2.address)).to.equal(3);
  expect(await tokenSale.getTokenSold()).to.equal(3);
  expect(await tokenSale.getBalance()).to.equal(
    ethers.parseUnits("15", "ether")
  );
});

it("owner pauses whitelist sale", async function () {
  await addToWhitelist(user2.address);

  await tokenSale.connect(owner).toggleWhitelistSaleActive();
  expect(await tokenSale.isWhitelistSaleActive()).to.equal(false);
  //this should fail and revert
  //! It is very important that await comes before the expect here
  await expect(
    tokenSale
      .connect(user2)
      .buyWhitesaleTokens(1, { value: ethers.parseUnits("5", "ether") })
  ).to.revertedWith("WhiteSale is not active");
});

it("owner ends whitesale and everyone can buy tokens", async function () {
  await tokenSale.connect(owner).toggleWhitelistSaleActive();
  await tokenSale.connect(owner).toggleSaleActive();

  //wait for 1 block
  await ethers.provider.send("evm_mine", []);

  await tokenSale
    .connect(user5)
    .buyTokens(2, { value: ethers.parseUnits("10", "ether") });

  expect(await token.balanceOf(user5.address)).to.equal(2);
  expect(await tokenSale.getTokenSold()).to.equal(2);
  expect(await tokenSale.getBalance()).to.equal(
    ethers.parseUnits("10", "ether")
  );
});

it("owner can withdraw ETH", async function () {
  await tokenSale.connect(owner).toggleWhitelistSaleActive();
  await tokenSale.connect(owner).toggleSaleActive();
  //wait for 1 block
  await ethers.provider.send("evm_mine", []);
  await tokenSale
    .connect(user5)
    .buyTokens(2, { value: ethers.parseUnits("10", "ether") });
  expect(await tokenSale.getBalance()).to.equal(
    ethers.parseUnits("10", "ether")
  );
  console.log("balance:", await ethers.provider.getBalance(tokenSaleAddress));
  const ownerBalance = await ethers.provider.getBalance(owner.address);
  console.log("Owner balance:", ownerBalance);
  const gasLimit = 1000000;
  await tokenSale.connect(owner).withdrawEth({ gasLimit });
  console.log("balance:", await ethers.provider.getBalance(tokenSaleAddress));
  const newOwnerBalance = await ethers.provider.getBalance(owner.address);
  console.log("New Owner balance:", newOwnerBalance);
  expect(await ethers.provider.getBalance(tokenSaleAddress)).to.equal(0);

  expect(newOwnerBalance).to.be.greaterThan(ownerBalance);
});
