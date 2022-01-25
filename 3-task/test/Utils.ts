import { ethers } from "hardhat";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  DonationPlatform__factory,
  DonationPlatform,
  DonationNFT__factory,
  DonationNFT,
} from "../typechain";

import { BigNumber } from "ethers";

export const ZERO = BigNumber.from(0);
export const ONE = BigNumber.from(1);

export const DEFAULT_CAMPAIGN_INFO = {
  name: "GenericCampaign",
  description: "GenericDescription",
  goalAmount: ethers.utils.parseEther("0.005"),
  receivedAmount: ZERO,
  duration: BigNumber.from(100000),
  expirationTime: ZERO,
  fundsWithdrawn: ZERO,
};

export const DEFAULT_DONATION_INFO = {
  campaignId: ZERO,
  amount: ethers.utils.parseEther("0.0001"),
};

export type T_UTILS = {
  donationPlatform: DonationPlatform;
  donationNFT: DonationNFT;

  administrator: SignerWithAddress;
  donators: SignerWithAddress[];
  donator1: SignerWithAddress;
  donator2: SignerWithAddress;
  otherDonators: SignerWithAddress[];
};

export let UTILS: T_UTILS;

// Deploys DonationPlatform and DonationNFT SCs
// Note: there is no transfer of ownership on DonationNFT - this must be done
// in order to enable calls to DonationPlatform.donate(...) which will award an NFT token
// to the first time donators - so the DonationPlatform needs to be the owner of DonationNFT
export async function deployContracts() {
  const [administrator, ...donators] = await ethers.getSigners();

  const donationNFT_Factory = (await ethers.getContractFactory(
    "DonationNFT",
    administrator
  )) as DonationNFT__factory;
  const donationNFT = await donationNFT_Factory.deploy("DonationNFT", "DNFT");
  const donationPlatform_Factory = (await ethers.getContractFactory(
    "DonationPlatform",
    administrator
  )) as DonationPlatform__factory;
  const donationPlatform = await donationPlatform_Factory.deploy(
    donationNFT.address
  );
  UTILS = {
    donationPlatform,
    donationNFT,
    administrator,
    donators,
    donator1: donators[0],
    donator2: donators[1],
    otherDonators: donators.slice(2),
  };
}

export type T_Campaign = {
  name: string;
  description: string;
  goalAmount: BigNumber;
  receivedAmount: BigNumber;
  duration: BigNumber;
  expirationTime: BigNumber;
  fundsWithdrawn: BigNumber;
};

export type T_Donation = {
  amount: BigNumber;
  campaignId: BigNumber | 0;
};

// Creates a campaign
// Note: it doesn't check if the signer has the priviligies neccessary
export async function createCampaign(
  signer: SignerWithAddress = UTILS.administrator, // account from which to try campaign creation
  campaignType: "random" | "default" = "random" // should the params be randomly chosen or by default
) {
  let { campaignInfo } = await randomness();
  campaignInfo =
    campaignType === "default" ? DEFAULT_CAMPAIGN_INFO : campaignInfo;

  const txReceipt = await UTILS.donationPlatform
    .connect(signer)
    .createCampaign(
      campaignInfo.name,
      campaignInfo.description,
      campaignInfo.goalAmount,
      campaignInfo.duration
    );

  const campaignId = (await UTILS.donationPlatform.campaignsCounter()).sub(ONE);

  return { txReceipt, campaignId, campaignInfo };
}

// Makes a donation to a campaign.
// Note: it doesn't check if the TX will fail for any reason
export async function donate(
  _campaignId?: BigNumber, // donates to campaign with that ID
  _props?: {
    _signer?: SignerWithAddress; // donator account, if not provided then its random
    _amount?: BigNumber; // how much to donate, if not provided then its random
    _reachesGoalAmount?: boolean; // will this donation reach the goal amount, if not provided then its random
  }
) {
  let { campaignId, donator, amount } = await randomness();

  if (_campaignId !== undefined) campaignId = _campaignId;

  const campaign = await UTILS.donationPlatform.campaigns(campaignId);

  const untilGoalAmount = campaign.goalAmount.sub(campaign.receivedAmount);

  if (_props !== undefined && _props._signer !== undefined)
    donator = _props._signer;
  if (_props !== undefined && _props._amount !== undefined)
    amount = _props._amount;
  if (_props !== undefined && _props._reachesGoalAmount === true) {
    amount = amount.add(untilGoalAmount);
  }
  if (_props !== undefined && _props._reachesGoalAmount === false) {
    amount = untilGoalAmount.div(3); // subjectively chosen number 3 - it just matter it doesn't reach goal amount
  }

  const txReceipt = await UTILS.donationPlatform
    .connect(donator)
    .donate(campaignId, {
      value: amount,
    });

  return { donator, campaignId, amount, txReceipt };
}

// Makes a withdrawal
// Note: it doesn't check if the signer has the priviligies neccessary
export async function withdrawal(
  user: SignerWithAddress,
  campaignId: BigNumber
) {
  return await UTILS.donationPlatform.connect(user).withdraw(campaignId);
}

// Generates random objects that can be used by other functions
export async function randomness() {
  // randomly choose an account from which donations can be made
  const donator =
    UTILS.donators[Math.floor(Math.random() * UTILS.donators.length)];
  // randomly choose a ID for a campaign (ID that is valid)
  const nCampaigns = (
    await UTILS.donationPlatform.campaignsCounter()
  ).toNumber();
  const campaignId = BigNumber.from(
    Math.floor(Math.random() * nCampaigns).toFixed(0)
  );
  // randomly choose an amount that can be used for donations
  const amount = ethers.utils.parseEther((2 * Math.random()).toFixed(3));

  // randomly create all the information necessary for a campaign
  let campaignInfo: T_Campaign = {
    name: "CAMPAIGN-" + Math.random().toFixed(4), // it only matters that names are unique
    description: "DESCRIPTION-" + Math.random().toFixed(4), // it only matters that descriptions are unique
    goalAmount: BigNumber.from(
      ethers.utils.parseEther((Math.random() / 100).toFixed(6)) // not a large number - because of tesnet limitations
    ),
    receivedAmount: ZERO,
    expirationTime: ZERO, // Careful : this can only be determined after the block has been mined
    duration: BigNumber.from((10000 + Math.random() * 10).toFixed(0)),
    fundsWithdrawn: ZERO,
  };

  return { donator, campaignId, amount, campaignInfo };
}
