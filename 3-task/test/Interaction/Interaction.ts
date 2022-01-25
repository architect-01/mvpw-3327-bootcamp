import { expect } from "chai";
import { ethers } from "hardhat";

import { BigNumber } from "ethers";
import {
  UTILS,
  deployContracts,
  donate,
  createCampaign,
  ONE,
  ZERO,
  randomness,
} from "../Utils";

describe("Interaction: DonationPlatform and DonationNFT SC", function () {
  beforeEach(async function () {
    await deployContracts();

    await UTILS.donationNFT
      .connect(UTILS.administrator)
      .transferOwnership(UTILS.donationPlatform.address);

    await createCampaign();
  });
  describe("Correct Use", function () {
    describe("Initial State", function () {
      it("no tests - unit tests covered it", async function () {});
    });

    describe("State Update", function () {
      it("awards an NFT to a first time donator", async function () {
        const { donator } = await randomness();

        expect(await UTILS.donationNFT.balanceOf(donator.address)).to.eq(ZERO);

        await donate(ZERO, { _signer: donator });

        expect(await UTILS.donationNFT.balanceOf(donator.address)).to.eq(ONE);
      });

      it("it doesnt award an NFT after subsequent donations to the same campaign", async function () {
        const { donator } = await randomness();

        for (let i = 0; i < 10; ++i) {
          await donate(ZERO, { _signer: donator, _reachesGoalAmount: false });
        }

        expect(await UTILS.donationNFT.balanceOf(donator.address)).to.eq(ONE);
      });

      it("it doesnt award an NFT after subsequent donations to different campaigns", async function () {
        for (let i = 0; i < 10; ++i) {
          await createCampaign();
        }

        const { donator } = await randomness();

        for (let i = ZERO; i.lte(BigNumber.from(10)); i = i.add(ONE)) {
          await donate(i, { _signer: donator, _reachesGoalAmount: false });
        }

        expect(await UTILS.donationNFT.balanceOf(donator.address)).to.eq(ONE);
      });
      it("it doesnt mix awards between donators", async function () {
        const { donators } = UTILS;

        for (let i = 0; i < donators.length; i++) {
          await donate(ZERO, {
            _signer: donators[i],
            _reachesGoalAmount: false,
          });
        }
        for (let i = 0; i < donators.length; i++) {
          expect(await UTILS.donationNFT.balanceOf(donators[i].address)).to.eq(
            ONE
          );
        }
      });
    });
  });
  describe("Incorrect Use", function () {
    describe("Access", function () {
      it("no tests - unit tests covered it", async function () {});
    });
    describe("Bad params", function () {
      it("no tests - unit tests covered it", async function () {});
    });
  });
});
