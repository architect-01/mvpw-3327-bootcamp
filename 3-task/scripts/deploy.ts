const hre = require("hardhat");

async function main() {
  const DonationNFT = await hre.ethers.getContractFactory("DonationNFT");
  const donationNFT = await DonationNFT.deploy("DonationNFT", "DNFT");
  await donationNFT.deployed();
  console.log("donationNFT deployed to:", donationNFT.address);

  const DonationPlatform = await hre.ethers.getContractFactory(
    "DonationPlatform"
  );
  const donationPlatform = await DonationPlatform.deploy(donationNFT.address);
  await donationPlatform.deployed();
  console.log("donationPlatform deployed to:", donationPlatform.address);

  await donationNFT.transferOwnership(donationPlatform.address);
  const nftFactoryOwner = await donationNFT.owner();
  console.log("New owner of DonationNFT contract :", nftFactoryOwner);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
