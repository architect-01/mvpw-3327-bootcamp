import { expect } from "chai";
import { ethers } from "hardhat";

import { BigNumber } from "ethers";
import {
  UTILS,
  deployContracts,
  createCampaign,
  donate,
  withdrawal,
  ZERO,
  ONE,
  randomness,
} from "../Utils";

describe("DonationsPlatform - Withdrawals", function () {
  beforeEach(async function () {
    await deployContracts();
    await UTILS.donationNFT
      .connect(UTILS.administrator)
      .transferOwnership(UTILS.donationPlatform.address);
  });
  describe("Correct Use", function () {
    // describe("Initial State", function () {
    //   it("no tests - withdrawals are not tracked", async function () {});
    // });

    describe("State Update", function () {
      it("able to withdraw campaign funds after goal amount has been reached", async function () {
        const { campaignId } = await createCampaign();

        await donate(campaignId, { _reachesGoalAmount: true });

        await withdrawAndCompare(campaignId);
      });

      it("able to withdraw campaign funds after time goal has been reached", async function () {
        const { campaignInfo } = await randomness();
        await UTILS.donationPlatform
          .connect(UTILS.administrator)
          .createCampaign(
            campaignInfo.name,
            campaignInfo.description,
            campaignInfo.goalAmount,
            BigNumber.from(5) // duration
          );

        await donate(ZERO);

        await new Promise((r) => setTimeout(r, 6000));

        await withdrawAndCompare(ZERO);
      });

      it("sets fundsWithdrawn to 1 after withdrawal", async function () {
        await createCampaign();

        await donate(ZERO, { _reachesGoalAmount: true });

        await withdrawal(UTILS.administrator, ZERO);

        expect(
          (await UTILS.donationPlatform.campaigns(ZERO)).fundsWithdrawn
        ).to.eq(1);
      });

      it("emits an event after withdrawal has been made", async function () {
        await createCampaign();

        await donate(ZERO, { _reachesGoalAmount: true });

        const { receivedAmount } = await UTILS.donationPlatform.campaigns(ZERO);

        const txReceipt = await withdrawal(UTILS.administrator, ZERO);

        await expect(txReceipt)
          .to.emit(UTILS.donationPlatform, "WithdrawalMade")
          .withArgs(0, receivedAmount);
      });

      it("can withdraw after multiple donations", async function () {
        await createCampaign();

        for (let i = 0; i < 5; i++) {
          await donate(ZERO, { _reachesGoalAmount: false });
        }

        await donate(ZERO, { _reachesGoalAmount: true });

        await withdrawAndCompare(ZERO);
      });
    });
  });

  describe("Incorrect Use", function () {
    beforeEach(async function () {
      await createCampaign();
    });

    describe("Access", function () {
      it("reverts when called by non-administrator", async function () {
        await expect(withdrawal(UTILS.donator1, ZERO)).to.be.revertedWith(
          "Ownable: caller is not the owner"
        );
      });
    });

    describe("Bad Params", function () {
      it("reverts when trying to withdraw for a campaign not yet created", async function () {
        await expect(withdrawal(UTILS.administrator, ONE)).to.be.revertedWith(
          "Cannot withdraw - Campaign with that ID has not yet been created."
        );
      });

      it("reverts when trying to withdraw for a campaign with no goals reached", async function () {
        await expect(withdrawal(UTILS.administrator, ZERO)).to.be.revertedWith(
          "Cannot withdraw - Campaign is not yet finished or the goal has not been reached."
        );
      });

      it("everts when trying to withdraw for a second time", async function () {
        await donate(ZERO, { _reachesGoalAmount: true });
        await withdrawal(UTILS.administrator, ZERO);
        await expect(withdrawal(UTILS.administrator, ZERO)).to.be.revertedWith(
          "Cannot withdraw - Funds for this campaign have already been withdrawn."
        );
      });
    });
  });
});
async function withdrawAndCompare(campaignId: BigNumber) {
  const TX_FEE = ethers.utils.parseEther("0.002");

  const previousBalance = await ethers.provider.getBalance(
    UTILS.administrator.address
  );

  const { goalAmount } = await UTILS.donationPlatform.campaigns(campaignId);

  await withdrawal(UTILS.administrator, campaignId);
  const currentBalance = await ethers.provider.getBalance(
    UTILS.administrator.address
  );
  expect(currentBalance.sub(previousBalance.add(goalAmount))).to.lt(TX_FEE);
}
