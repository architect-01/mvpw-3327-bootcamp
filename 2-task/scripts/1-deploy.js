const hre = require("hardhat");

async function main() {
  const DonationNFT = await hre.ethers.getContractFactory("DonationNFT");
  const donationNFT = await DonationNFT.deploy("DonationNFT", "DNFT");
  await donationNFT.deployed();
  console.log("donationNFT deployed to:", donationNFT.address);

  const DonationPlatformV2 = await hre.ethers.getContractFactory(
    "DonationPlatformV2"
  );
  const donationPlatformV2 = await DonationPlatformV2.deploy(
    donationNFT.address
  );
  await donationPlatformV2.deployed();
  console.log("donationPlatformV2 deployed to:", donationPlatformV2.address);

  await donationNFT.transferOwnership(donationPlatformV2.address);
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
