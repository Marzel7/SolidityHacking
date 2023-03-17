const {ethers} = require("hardhat");
const {expect} = require("chai");

describe("ERC721 Tokens Exercise 2", function () {
  let deployer, user1, user2, user3;

  const CUTE_NFT_PRICE = ethers.utils.parseEther("5");
  const BOOBLES_NFT_PRICE = ethers.utils.parseEther("7");

  before(async function () {
    /** Deployment and minting tests */

    [deployer, user1, user2, user3] = await ethers.getSigners();

    // User1 creates his own NFT collection
    let NFTFactory = await ethers.getContractFactory("contracts/utils/DummyERC721.sol:DummyERC721", user1);
    this.cuteNFT = await NFTFactory.deploy("Crypto Cuties", "CUTE", 1000);
    await this.cuteNFT.mintBulk(30);
    expect(await this.cuteNFT.balanceOf(user1.address)).to.be.equal(30);

    // User3 creates his own NFT collection
    NFTFactory = await ethers.getContractFactory("DummyERC721", user3);
    this.booblesNFT = await NFTFactory.deploy("Rare Boobles", "BOO", 10000);
    await this.booblesNFT.mintBulk(120);
    expect(await this.booblesNFT.balanceOf(user3.address)).to.be.equal(120);

    // Store users initial balance
    this.user1InitialBalance = await ethers.provider.getBalance(user1.address);
    this.user2InitialBalance = await ethers.provider.getBalance(user2.address);
    this.user3InitialBalance = await ethers.provider.getBalance(user3.address);
  });

  it("Deployment & Listing Tests", async function () {
    /** CODE YOUR SOLUTION HERE */
    // TODO: Deploy Marketplace from deployer
    let OpenOcean = await ethers.getContractFactory("contracts/erc721-2/OpenOcean.sol:OpenOcean", user1);
    this.openOcean = await OpenOcean.deploy();
    // TODO: User1 lists Cute NFT tokens 1-10 for 5 ETH each
    await this.cuteNFT.connect(user1).setApprovalForAll(this.openOcean.address, true);
    for (let i = 1; i <= 10; i++) {
      await this.openOcean.connect(user1).listItem(this.cuteNFT.address, i, CUTE_NFT_PRICE);
    }
    // TODO: Check that Marketplace owns 10 Cute NFTs
    for (let i = 1; i <= 10; i++) {
      expect(await this.cuteNFT.ownerOf(i)).to.eq(this.openOcean.address);
    }
    // TODO: Checks that the marketplace mapping is correct (All data is correct), check the 10th item.
    let nftData = await this.openOcean.items(10);
    expect(nftData[0]).to.eq(10);
    expect(nftData[1]).to.eq(this.cuteNFT.address);
    expect(nftData[2]).to.eq(10);
    expect(nftData[3]).to.eq(CUTE_NFT_PRICE);
    expect(nftData[4]).to.eq(user1.address);
    expect(nftData[5]).to.eq(false);

    // TODO: User3 lists Boobles NFT tokens 1-5 for 7 ETH each
    await this.booblesNFT.connect(user3).setApprovalForAll(this.openOcean.address, true);
    for (let i = 1; i <= 5; i++) {
      await this.openOcean.connect(user3).listItem(this.booblesNFT.address, i, BOOBLES_NFT_PRICE);
    }
    // TODO: Check that Marketplace owns 5 Booble NFTs
    for (let i = 1; i <= 5; i++) {
      expect(await this.booblesNFT.ownerOf(i)).to.eq(this.openOcean.address);
    }
    // TODO: Checks that the marketplace mapping is correct (All data is correct), check the 15th item.
    nftData = await this.openOcean.items(15);
    expect(nftData[0]).to.eq(15);
    expect(nftData[1]).to.eq(this.booblesNFT.address);
    expect(nftData[2]).to.eq(5);
    expect(nftData[3]).to.eq(BOOBLES_NFT_PRICE);
    expect(nftData[4]).to.eq(user3.address);
    expect(nftData[5]).to.eq(false);
  });

  it("Purchases Tests", async function () {
    /** CODE YOUR SOLUTION HERE */
    // All Purchases From User2 //
    // TODO: Try to purchase itemId 100, should revert
    await expect(this.openOcean.connect(user3).purchase(100, {value: BOOBLES_NFT_PRICE})).to.be.revertedWith(
      "incorrect _itemId"
    );
    // TODO: Try to purchase itemId 3, without ETH, should revert
    await expect(this.openOcean.connect(user3).purchase(3, {value: ethers.utils.parseEther("0")})).to.be.revertedWith(
      "insufficient payment"
    );
    // TODO: Try to purchase itemId 3, with ETH, should work
    await this.openOcean.connect(user3).purchase(3, {value: CUTE_NFT_PRICE});
    // TODO: Can't purchase sold item
    await expect(this.openOcean.connect(user3).purchase(3, {value: CUTE_NFT_PRICE})).to.be.revertedWith(
      "item is not listed"
    );
    // TODO: User2 owns itemId 3 -> Cuties tokenId 3
    expect(await this.cuteNFT.ownerOf(3)).to.eq(user3.address);
    // TODO: User1 got the right amount of ETH for the sale
    this.user1Balance = await ethers.provider.getBalance(user1.address);
    expect(this.user1Balance).to.be.gt(this.user1InitialBalance);
    // TODO: Purchase itemId 11
    await this.openOcean.connect(user2).purchase(11, {value: BOOBLES_NFT_PRICE});
    // TODO: User2 owns itemId 11 -> Boobles tokenId 1
    expect(await this.booblesNFT.ownerOf(1)).to.eq(user2.address);
    // TODO: User3 got the right amount of ETH for the sale
    this.user3Balance = await ethers.provider.getBalance(user3.address);
    expect(this.user3Balance).to.be.gt(this.user3InitialBalance);
  });
});
