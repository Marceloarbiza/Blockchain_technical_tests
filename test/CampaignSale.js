const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CampaignSale", function () {
  let me, bob, steve;

  before(async function () {
    const [me, bob, steve] = await ethers.getSigners();

    const erc20Factory = await ethers.getContractFactory("ERC20TestToken");
    this.erc20Token = await erc20Factory.deploy(2000000);
    await this.erc20Token.deployed();

    const campaignSaleFactory = await ethers.getContractFactory("CampaignSale");
    this.campaignSaleContract = await campaignSaleFactory.deploy(
      this.erc20Token.address
    );
    await this.campaignSaleContract.deployed();

    this.erc20Token.transfer(me.address, 10000);
    this.erc20Token.transfer(bob.address, 20000);
    this.erc20Token.transfer(steve.address, 30000);

    // 1 Week = 604800 sec
    const oneWeek = 60 * 60 * 24 * 7;

    const blockNum = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNum);
    this.timestampBlock = block.timestamp;

    this.dateOneWeekLater = this.timestampBlock + oneWeek;
    this.dateTwoWeekLater = this.timestampBlock + oneWeek * 2;
  });

  describe("Launch Campaign", function () {
    it("Campaign goal must be greater than 0", async function () {
      const [me, bob, steve] = await ethers.getSigners();

      await expect(
        this.campaignSaleContract.launchCampaign(
          0,
          this.dateOneWeekLater,
          this.dateTwoWeekLater
        )
      ).to.be.revertedWith("Goal must be grater than 0.");
    });
    it("Date start must be in the future", async function () {
      const [me, bob, steve] = await ethers.getSigners();

      await expect(
        this.campaignSaleContract.launchCampaign(
          10,
          this.timestampBlock - 1000,
          this.dateTwoWeekLater
        )
      ).to.be.revertedWith("Campaign must start in the future.");
    });
    it("Date end must be in the future", async function () {
      const [me, bob, steve] = await ethers.getSigners();

      await expect(
        this.campaignSaleContract.launchCampaign(
          10,
          this.dateOneWeekLater,
          this.timestampBlock - 1000
        )
      ).to.be.revertedWith("Campaign must end in the future.");
    });
    it("Date end must be after date start", async function () {
      const [me, bob, steve] = await ethers.getSigners();

      await expect(
        this.campaignSaleContract.launchCampaign(
          10,
          this.dateTwoWeekLater,
          this.dateOneWeekLater
        )
      ).to.be.revertedWith("Ending date must be brefore Start date.");
    });
    it("Campaign duration maximum 90 days", async function () {
      const [me, bob, steve] = await ethers.getSigners();

      const ninetyDays = 60 * 60 * 24 * 90;

      await expect(
        this.campaignSaleContract.launchCampaign(
          10,
          this.dateOneWeekLater,
          this.dateTwoWeekLater + ninetyDays
        )
      ).to.be.revertedWith("A campaign should last a maximum of 90 days.");
    });
    it("Launch a Campaign", async function () {
      const [me, bob, steve] = await ethers.getSigners();

      const nWeeks = 60 * 60 * 24 * 7 * 2;

      // 1 - Ok Campaign - goal
      await this.campaignSaleContract.launchCampaign(
        1000,
        this.dateOneWeekLater,
        this.dateTwoWeekLater + nWeeks
      );

      // 2 - Campaign to cancel
      await this.campaignSaleContract.launchCampaign(
        666,
        this.dateOneWeekLater,
        this.dateTwoWeekLater
      );

      // 3 - Campaign has not started yet
      await this.campaignSaleContract.launchCampaign(
        3200,
        this.dateOneWeekLater + nWeeks,
        this.dateTwoWeekLater + nWeeks
      );

      // 4 - Campaign finished - start now + 1 day and finish now + 2 day
      await this.campaignSaleContract.launchCampaign(
        8888,
        this.timestampBlock + 60 * 60 * 24,
        this.timestampBlock + 60 * 60 * 24 * 2
      );

      // 5 - Ok Campaign - no goal
      await this.campaignSaleContract.launchCampaign(
        1000,
        this.dateOneWeekLater,
        this.dateTwoWeekLater + nWeeks
      );

      // 6
      await this.campaignSaleContract
        .connect(bob)
        .launchCampaign(
          500000,
          this.dateOneWeekLater + 100000,
          this.dateTwoWeekLater + 100000
        );

      // 7
      await this.campaignSaleContract
        .connect(steve)
        .launchCampaign(
          8000000,
          this.dateOneWeekLater + 100000,
          this.dateTwoWeekLater + 100000
        );

      // 8
      await this.campaignSaleContract.launchCampaign(
        1000,
        this.dateOneWeekLater,
        this.dateTwoWeekLater + nWeeks
      );

      const n1Weeks = 60 * 60 * 24 * 7 * 1.5; // 1.5 weeks
      const n2Weeks = 60 * 60 * 24 * 7 * 100; // 100 weeks

      const n3Weeks = n1Weeks + n2Weeks;

      // 9
      await this.campaignSaleContract.launchCampaign(
        1000,
        this.dateOneWeekLater,
        this.dateTwoWeekLater + nWeeks
      );

      // 10
      await this.campaignSaleContract.launchCampaign(
        1000,
        this.dateOneWeekLater + n3Weeks - 1000,
        this.dateTwoWeekLater + n3Weeks + nWeeks
      );

      expect((await this.campaignSaleContract.getCampaign(1)).goal).to.equal(
        1000
      );
    });

    describe("Cancel Campaign", function () {
      it("Only the creator can cancel the campaing", async function () {
        const [me, bob, steve] = await ethers.getSigners();

        await expect(
          this.campaignSaleContract.connect(bob).cancelCampaign(1)
        ).to.be.revertedWith("Only creator can call this function.");
      });
      it("Should cancel a Campaign", async function () {
        const [me, bob, steve] = await ethers.getSigners();

        const existCampaign = await this.campaignSaleContract.getCampaign(2);

        await this.campaignSaleContract.cancelCampaign(2);

        await expect(
          this.campaignSaleContract.getCampaign(2)
        ).to.be.revertedWith("The campaign does not exist.");
      });
      it("Can not cancel a campaing if already started", async function () {
        const [me, bob, steve] = await ethers.getSigners();

        const nWeeks = 60 * 60 * 24 * 7 * 1.5;

        await ethers.provider.send("evm_increaseTime", [nWeeks]);
        await ethers.provider.send("evm_mine");

        await expect(
          this.campaignSaleContract.cancelCampaign(1)
        ).to.be.revertedWith(
          "The campaign has already started, you can't cancel it."
        );
      });
    });

    describe("Contribute to Campaign", function () {
      it("Can not contribute if the campaign is not launched", async function () {
        const [me, bob, steve] = await ethers.getSigners();

        await expect(
          this.campaignSaleContract.contribute(90, 100)
        ).to.be.revertedWith("The campaign does not exist.");
      });

      it("Can not contribute if the campaign is finished", async function () {
        const [me, bob, steve] = await ethers.getSigners();

        await expect(
          this.campaignSaleContract.contribute(4, 100)
        ).to.be.revertedWith("The campaign has finished.");
      });

      it("Can not contribute if the campaign is not started", async function () {
        const [me, bob, steve] = await ethers.getSigners();

        await expect(
          this.campaignSaleContract.contribute(3, 100)
        ).to.be.revertedWith("The campaign has not started yet.");
      });

      it("Should contribute", async function () {
        const [me, bob, steve] = await ethers.getSigners();

        await this.erc20Token.approve(
          this.campaignSaleContract.address,
          2000000
        );

        const initalERC20BalanceContributor = await this.erc20Token.balanceOf(
          me.address
        );

        expect(await this.campaignSaleContract.contribute(1, 800)).to.emit(
          this.campaignSaleContract,
          "Contribute"
        );

        const finalERC20BalanceContributor = await this.erc20Token.balanceOf(
          me.address
        );

        expect(
          initalERC20BalanceContributor - finalERC20BalanceContributor
        ).to.equal((await this.campaignSaleContract.getCampaign(1)).pledged);

        expect(
          await this.erc20Token.balanceOf(this.campaignSaleContract.address)
        ).to.equal((await this.campaignSaleContract.getCampaign(1)).pledged);
      });
    });

    describe("Withdraw Campaign", function () {
      it("Can not withdraw if the campaign is not launched", async function () {
        const [me, bob, steve] = await ethers.getSigners();

        await expect(
          this.campaignSaleContract.withdraw(90, 1000)
        ).to.be.revertedWith("The campaign does not exist.");
      });

      it("Can not withdraw if the campaign finished", async function () {
        const [me, bob, steve] = await ethers.getSigners();

        await expect(
          this.campaignSaleContract.withdraw(4, 100)
        ).to.be.revertedWith("The campaign has finished.");
      });

      it("Can not withdraw if the campaign is not started", async function () {
        const [me, bob, steve] = await ethers.getSigners();

        await expect(
          this.campaignSaleContract.withdraw(3, 100)
        ).to.be.revertedWith("The campaign has not started yet.");
      });

      it("You can not withdraw if you have not contributed", async function () {
        const [me, bob, steve] = await ethers.getSigners();

        await expect(
          this.campaignSaleContract.connect(steve).withdraw(1, 100)
        ).to.be.revertedWith(
          "The amount to withdraw is greater than the amount you contributed."
        );
      });

      it("You can not withdraw if the amount is greater than amount contributed", async function () {
        const [me, bob, steve] = await ethers.getSigners();

        await expect(
          this.campaignSaleContract.withdraw(1, 10000)
        ).to.be.revertedWith(
          "The amount to withdraw is greater than the amount contributed."
        );
      });

      it("Should withdraw", async function () {
        const [me, bob, steve] = await ethers.getSigners();

        const initalERC20BalanceContributor = await this.erc20Token.balanceOf(
          me.address
        );

        expect(await this.campaignSaleContract.withdraw(1, 100)).to.emit(
          this.campaignSaleContract,
          "Withdraw"
        );

        const finalERC20BalanceContributor = await this.erc20Token.balanceOf(
          me.address
        );

        expect(
          finalERC20BalanceContributor - initalERC20BalanceContributor
        ).to.equal(100);
      });
    });
    describe("Claim Campaign", function () {
      it("Only the creator can claim the campaing", async function () {
        const [me, bob, steve] = await ethers.getSigners();

        await expect(
          this.campaignSaleContract.connect(bob).claimCampaign(1)
        ).to.be.revertedWith("Only creator can call this function.");
      });
      it("Can not claim if the campaign is not launched", async function () {
        const [me, bob, steve] = await ethers.getSigners();

        await expect(
          this.campaignSaleContract.claimCampaign(90)
        ).to.be.revertedWith("The campaign does not exist.");
      });

      it("Can not claim if the campaign has not finished", async function () {
        const [me, bob, steve] = await ethers.getSigners();

        await expect(
          this.campaignSaleContract.claimCampaign(1)
        ).to.be.revertedWith("The campaign has not finished yet.");
      });

      it("Can not claim if the goal of the campaign has not been reached", async function () {
        const [me, bob, steve] = await ethers.getSigners();

        await this.erc20Token
          .connect(bob)
          .approve(this.campaignSaleContract.address, 2000000);

        await this.erc20Token
          .connect(steve)
          .approve(this.campaignSaleContract.address, 2000000);

        // 1
        await this.campaignSaleContract.connect(bob).contribute(1, 500);
        await this.campaignSaleContract.connect(steve).contribute(1, 600);

        // 3
        await this.campaignSaleContract.contribute(8, 20);

        // 5
        await this.campaignSaleContract.contribute(5, 50);
        await this.campaignSaleContract.connect(bob).contribute(5, 200);

        // 8
        await this.campaignSaleContract.contribute(8, 2000);

        // 9
        await this.campaignSaleContract.contribute(9, 800);

        const nnWeeks = 60 * 60 * 24 * 7 * 100; // 100 weeks

        await ethers.provider.send("evm_increaseTime", [nnWeeks]);
        await ethers.provider.send("evm_mine");

        await expect(
          this.campaignSaleContract.connect(bob).claimCampaign(5)
        ).to.be.revertedWith("Only creator can call this function.");

        await expect(
          this.campaignSaleContract.claimCampaign(5)
        ).to.be.revertedWith("The goal of the campaign has not been reached.");
      });

      it("Should claim", async function () {
        const [me, bob, steve] = await ethers.getSigners();

        const initalERC20BalanceCreator = await this.erc20Token.balanceOf(
          me.address
        );

        expect(await this.campaignSaleContract.claimCampaign(1)).to.emit(
          this.campaignSaleContract,
          "ClaimCampaign"
        );

        await expect(
          this.campaignSaleContract.claimCampaign(1)
        ).to.be.revertedWith("Campaign was already claimed.");

        const finalERC20BalanceCreator = await this.erc20Token.balanceOf(
          me.address
        );

        /**
         * contribute: 800
         * withdraw: (100)
         * contribute: 500
         * contribute: 700
         */
        expect(finalERC20BalanceCreator - initalERC20BalanceCreator).to.equal(
          1800
        );
      });
    });
    describe("Refund Campaign", async function () {
      it("Can not refund if the campaign is not launched", async function () {
        const [me, bob, steve] = await ethers.getSigners();

        await expect(
          this.campaignSaleContract.refundCampaign(90)
        ).to.be.revertedWith("The campaign does not exist.");
      });
      it("Can not refund if the campaign has not finished", async function () {
        const [me, bob, steve] = await ethers.getSigners();

        await expect(
          this.campaignSaleContract.refundCampaign(10)
        ).to.be.revertedWith("The campaign has not finished yet.");
      });
      it("Can refund if goal has been reached", async function () {
        const [me, bob, steve] = await ethers.getSigners();

        await expect(
          this.campaignSaleContract.refundCampaign(8)
        ).to.be.revertedWith("The goal of the campaign has been reached.");
      });
      it("Can refund if you did not contributed", async function () {
        const [me, bob, steve] = await ethers.getSigners();

        await expect(
          this.campaignSaleContract.connect(steve).refundCampaign(9)
        ).to.be.revertedWith("You have not contributed to this campaign.");
      });
      it("Should refund", async function () {
        const [me, bob, steve] = await ethers.getSigners();

        const initalERC20BalanceContributor = await this.erc20Token.balanceOf(
          me.address
        );

        await this.campaignSaleContract.refundCampaign(9);

        const finalERC20BalanceContributor = await this.erc20Token.balanceOf(
          me.address
        );

        expect(
            finalERC20BalanceContributor - initalERC20BalanceContributor
        ).to.equal(800);
      });
    });
  });
});
