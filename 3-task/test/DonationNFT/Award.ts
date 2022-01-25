import { expect } from "chai";
import { ethers } from "hardhat";

import { BigNumber } from "ethers";
import { UTILS, deployContracts, ZERO, ONE, randomness } from "../Utils";

describe("DonationNFT - Awards", function () {
  beforeEach(async function () {
    await deployContracts();
  });

  describe("Correct Use", function () {
    describe("Initial State", function () {
      it("has 0 tokens awarded after SC deployment", async function () {
        const tokenCounter = await UTILS.donationNFT.tokenCounter();
        expect(tokenCounter).to.eq(ZERO);
      });
    });

    describe("State Update", function () {
      it("increments token counter after an award", async function () {
        const { donator } = await randomness();
        await UTILS.donationNFT
          .connect(UTILS.administrator)
          .award(donator.address);
        const tokenCounter = await UTILS.donationNFT.tokenCounter();
        expect(tokenCounter).to.eq(ONE);
      });

      it("increments token counter after multiple awards", async function () {
        for (let i = ONE; i.lte(BigNumber.from(23)); i = i.add(ONE)) {
          await UTILS.donationNFT
            .connect(UTILS.administrator)
            .award(UTILS.donator1.address);
          expect(await UTILS.donationNFT.tokenCounter()).to.eq(i);
        }
      });

      it("adds token to the address' balance", async function () {
        const { donator } = await randomness();
        await UTILS.donationNFT
          .connect(UTILS.administrator)
          .award(donator.address);
        expect(await UTILS.donationNFT.balanceOf(donator.address)).to.eq(ONE);
      });

      it("adds multiple tokens to the address' balance", async function () {
        const { donator } = await randomness();
        for (let i = ONE; i.lte(BigNumber.from(23)); i = i.add(ONE)) {
          await UTILS.donationNFT
            .connect(UTILS.administrator)
            .award(donator.address);
          expect(await UTILS.donationNFT.balanceOf(donator.address)).to.eq(i);
        }
      });
    });
  });

  describe("Incorrect Use", function () {
    beforeEach(async function () {});

    describe("Access", function () {
      it("reverts when called by non-owner", async function () {
        await expect(
          UTILS.donationNFT
            .connect(UTILS.donator1)
            .award(UTILS.donator1.address)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });

    describe("Bad Params", function () {
      it("no test - there are no additional params", async function () {});
    });
  });
});
