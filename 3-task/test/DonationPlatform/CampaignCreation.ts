import { expect } from "chai";
import { ethers } from "hardhat";

import { BigNumber, ContractTransaction } from "ethers";
import {
  UTILS,
  deployContracts,
  createCampaign,
  ZERO,
  ONE,
  randomness,
  T_Campaign,
} from "../Utils";

describe("DonationsPlatform - Campaign Creation", function () {
  beforeEach(async function () {
    await deployContracts();

    await UTILS.donationNFT
      .connect(UTILS.administrator)
      .transferOwnership(UTILS.donationPlatform.address);
  });
  describe("Correct Use", function () {
    describe("Initial State", function () {
      it("has 0 campaigns after SC deployment", async function () {
        const campaignCounter = await UTILS.donationPlatform.campaignsCounter();
        expect(campaignCounter).to.eq(ZERO);
      });
    });

    describe("State Update", function () {
      let campaignInfo: T_Campaign;
      let campaign: any; // typechain doesn't expose struct types from SC
      let txReceipt: ContractTransaction;
      beforeEach(async function () {
        const temp = await createCampaign();
        campaignInfo = temp.campaignInfo;
        txReceipt = temp.txReceipt;
        campaign = await UTILS.donationPlatform.campaigns(ZERO);
      });
      it("increments the campaign counter after campaign creation", async function () {
        const campaignCounter = await UTILS.donationPlatform.campaignsCounter();
        expect(campaignCounter).to.eq(ONE);
      });

      it("sets the correct name for the campaign", async function () {
        expect(campaign.name).to.eq(campaignInfo.name);
      });

      it("sets the correct description for the campaign", async function () {
        expect(campaign.description).to.eq(campaignInfo.description);
      });

      it("sets the correct goal amount for the campaign", async function () {
        expect(campaign.goalAmount).to.eq(campaignInfo.goalAmount);
      });

      it("sets the received amount to 0 after campaign creation", async function () {
        expect(campaign.receivedAmount).to.eq(ZERO);
      });

      it("sets the expirationTime to the correct value", async function () {
        const expirationTime = BigNumber.from(
          (await ethers.provider.getBlock("latest")).timestamp
        ).add(campaignInfo.duration);
        expect(campaign.expirationTime).to.eq(expirationTime);
      });

      it("sets the fundsWithdrawn to 0 after campaign creation", async function () {
        expect(campaign.fundsWithdrawn).to.eq(ZERO);
      });

      it("can create multiple campaigns", async function () {
        for (let i = ZERO; i.lt(BigNumber.from(10)); i = i.add(ONE)) {
          const { campaignInfo, txReceipt } = await createCampaign();
          const campaignCounter =
            await UTILS.donationPlatform.campaignsCounter();
          expect(campaignCounter).to.eq(i.add(2));
          const campaign = await UTILS.donationPlatform.campaigns(i.add(ONE));
          expect(campaign.name).to.eq(campaignInfo.name);
          expect(campaign.description).to.eq(campaignInfo.description);
          expect(campaign.goalAmount).to.eq(campaignInfo.goalAmount);
          expect(campaign.receivedAmount).to.eq(ZERO);
          const expirationTime = BigNumber.from(
            (await ethers.provider.getBlock("latest")).timestamp
          ).add(campaignInfo.duration);
          expect(campaign.expirationTime).to.eq(expirationTime);
          expect(campaign.fundsWithdrawn).to.eq(ZERO);
        }
      });

      it("emits an event that a campaign has been created", async function () {
        const expirationTime = BigNumber.from(
          (await ethers.provider.getBlock("latest")).timestamp
        ).add(campaignInfo.duration);
        await expect(txReceipt)
          .to.emit(UTILS.donationPlatform, "CampaignCreated")
          .withArgs(
            ZERO,
            campaignInfo.name,
            campaignInfo.description,
            campaignInfo.goalAmount,
            expirationTime
          );
      });
    });
  });

  describe("Incorrect Use", function () {
    describe("Access", function () {
      it("reverts campaign creation if it is tried by non-administrator", async function () {
        await expect(createCampaign(UTILS.donator1)).to.be.revertedWith(
          "Ownable: caller is not the owner"
        );
      });
    });
    describe("Bad params", async function () {
      it("reverts campaign creation when it's duration is 0 seconds", async function () {
        const { campaignInfo } = await randomness();
        await expect(
          UTILS.donationPlatform.connect(UTILS.administrator).createCampaign(
            campaignInfo.name,
            campaignInfo.description,
            campaignInfo.goalAmount,
            ZERO // duration
          )
        ).to.be.revertedWith("Campaign cannot last 0 seconds.");
      });

      it("reverts campaign creation when it's goal amount is 0", async function () {
        const { campaignInfo } = await randomness();

        await expect(
          UTILS.donationPlatform.connect(UTILS.administrator).createCampaign(
            campaignInfo.name,
            campaignInfo.description,
            ZERO, // goal amount
            campaignInfo.duration
          )
        ).to.be.revertedWith("Campaign goal amount cannot be 0.");
      });
    });
  });
});
