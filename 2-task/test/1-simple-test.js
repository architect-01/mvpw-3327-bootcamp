const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DonationPlatformV2 - Simple test", function () {
  it("Should mint an NFT to a first time donator", async function () {
    const [administrator, donator] = await ethers.getSigners();

    const DonationNFT = await hre.ethers.getContractFactory("DonationNFT");
    const donationNFT = await DonationNFT.deploy("DonationNFT", "DNFT");
    await donationNFT.deployed();
    //console.log("donationNFT deployed to:", donationNFT.address);

    const DonationPlatformV2 = await hre.ethers.getContractFactory(
      "DonationPlatformV2"
    );
    const donationPlatformV2 = await DonationPlatformV2.deploy(
      donationNFT.address
    );
    await donationPlatformV2.deployed();
    //console.log("donationPlatformV2 deployed to:", donationPlatformV2.address);

    await donationNFT.transferOwnership(donationPlatformV2.address);
    const nftFactoryOwner = await donationNFT.owner();
    //console.log("New owner of DonationNFT contract :", nftFactoryOwner);

    const campaignId = 0;
    await donationPlatformV2.connect(administrator).createCampaign(
      "Campaign-0",
      "Description-0",
      ethers.utils.parseEther("1.0"),
      24 * 60 * 60 // 24 hours
    );

    // before donating - user should have 0 NFTs
    expect(await donationNFT.balanceOf(donator.address)).to.equal(0);
    // making the donation
    await donationPlatformV2.connect(donator).donate(campaignId, {
      value: ethers.utils.parseEther("0.1"),
    });
    // after donating their NFT balance should be 1
    expect(await donationNFT.balanceOf(donator.address)).to.equal(1);
  });
});
