import { expect } from "chai";
import { ethers } from "hardhat";

import { BigNumber } from "ethers";
import {
  UTILS,
  deployContracts,
  createCampaign,
  donate,
  ONE,
  ZERO,
  randomness,
} from "../Utils";

describe("DonationsPlatform - Making Donations", function () {
  beforeEach(async function () {
    await deployContracts();

    await UTILS.donationNFT
      .connect(UTILS.administrator)
      .transferOwnership(UTILS.donationPlatform.address);
  });
  describe("Correct Use", function () {
    describe("Initial State", function () {
      it("no tests - donations are not tracked", async function () {});
    });

    describe("State Update", function () {
      let campaign: any;

      beforeEach(async function () {
        await createCampaign();

        campaign = await UTILS.donationPlatform.campaigns(ZERO);
      });

      it("able to donate to the campaign", async function () {
        const { donator, amount, campaignId } = await donate(ZERO, {
          _reachesGoalAmount: false,
        });

        campaign = await UTILS.donationPlatform.campaigns(campaignId);

        expect(campaign.receivedAmount).to.eq(amount);
        expect(
          await ethers.provider.getBalance(UTILS.donationPlatform.address)
        ).to.eq(amount);
      });

      it("caps the donation amount to reach only the campaign's goal amount", async function () {
        const { campaignId } = await randomness();

        const expectedBalance = (
          await UTILS.donationPlatform.campaigns(campaignId)
        ).goalAmount;

        await donate(campaignId, { _reachesGoalAmount: true });

        const actualBalance = await ethers.provider.getBalance(
          UTILS.donationPlatform.address
        );

        expect(expectedBalance).to.eq(actualBalance);
      });

      it("returns the excess funds to the donator", async function () {
        const allowedDifference = ethers.utils.parseEther("0.0002");

        const startingDonatorBalance = await ethers.provider.getBalance(
          UTILS.donator1.address
        );

        const { donator, amount, campaignId } = await donate(ZERO, {
          _reachesGoalAmount: true,
        });

        const actualDonatorBalance = await ethers.provider.getBalance(
          donator.address
        );

        const actualDifference = startingDonatorBalance.sub(
          actualDonatorBalance.add(amount)
        );
        expect(actualDifference).to.be.lt(allowedDifference);
      });

      it("emits an event after Donation has been made", async function () {
        const { donator, amount, campaignId, txReceipt } = await donate(ZERO, {
          _reachesGoalAmount: false,
        });

        const {
          name,
          description,
          expirationTime,
          goalAmount,
          receivedAmount,
        } = await UTILS.donationPlatform.campaigns(campaignId);
        const remainder = goalAmount.sub(receivedAmount);

        await expect(txReceipt)
          .to.emit(UTILS.donationPlatform, "CampaignReceivedDonation")
          .withArgs(
            campaignId,
            name,
            description,
            goalAmount,
            expirationTime,
            amount,
            remainder
          );
      });

      it("emits an event that the campaign has reached it's goal amount", async function () {
        const { campaignId } = await randomness();
        const { txReceipt } = await donate(campaignId, {
          _reachesGoalAmount: true,
        });

        const {
          name,
          description,
          expirationTime,
          goalAmount,
          receivedAmount,
        } = await UTILS.donationPlatform.campaigns(campaignId);

        expect(txReceipt)
          .to.emit(UTILS.donationPlatform, "CampaignGoalReached")
          .withArgs(campaignId, name, description, goalAmount, expirationTime);
      });
      it("adds multiple donations to the campaign's funds", async function () {
        let expectedBalance = ZERO;
        for (let i = 0; i < 5; i++) {
          const { amount } = await donate(ZERO, {
            _reachesGoalAmount: false,
          });
          expectedBalance = expectedBalance.add(amount);

          const campaign = await UTILS.donationPlatform.campaigns(ZERO);
          expect(campaign.receivedAmount).to.eq(expectedBalance);
          const actualBalance = await ethers.provider.getBalance(
            UTILS.donationPlatform.address
          );
          expect(actualBalance).to.eq(expectedBalance);
        }
      });
    });
  });

  describe("Incorrect Use", function () {
    describe("Access", function () {
      it("no tests - anyone can donate", async function () {});
    });
    describe("Bad params", async function () {
      beforeEach(async function () {
        const { campaignInfo } = await randomness();
        await UTILS.donationPlatform
          .connect(UTILS.administrator)
          .createCampaign(
            campaignInfo.name,
            campaignInfo.description,
            campaignInfo.goalAmount,
            BigNumber.from(5) // duration
          );
      });
      it("cannot donate 0 WEI", async function () {
        await expect(donate(ZERO, { _amount: ZERO })).to.be.revertedWith(
          "Cannot donate 0 WEI."
        );
      });

      it("reverts donation to a campaign not yet created", async function () {
        const { donator, amount } = await randomness();
        await expect(donate(BigNumber.from(101))).to.be.revertedWith(
          "Bad campaign ID - cannot donate to the campaigns not yet created."
        );
      });
      it("reverts donation when the goal amount has already been reached", async function () {
        const { donator, amount, campaignId } = await randomness();

        await donate(campaignId, { _reachesGoalAmount: true });

        await expect(donate(campaignId)).to.be.revertedWith(
          "Cannot donate - Funds for the campaign have already been gathered."
        );
      });
      it("reverts donation if the time goal has been reached", async function () {
        await new Promise((r) => setTimeout(r, 6000));

        await expect(donate(ZERO)).to.be.revertedWith(
          "Cannot donate - Time for the campaign has expired."
        );
      });
    });
  });
});
