const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = describe("Staking", function () {
  let me;
  let bob;
  let steve;

  before(async function () {
    const [me, bob, steve] = await ethers.getSigners();

    const erc20Factory = await ethers.getContractFactory("ERC20TestToken");
    this.erc20Token = await erc20Factory.deploy(2000000);
    await this.erc20Token.deployed();
    //console.log("ERC20 Token Address: " + this.erc20Token.address);

    const stakingFactory = await ethers.getContractFactory("Staking");
    this.stakingContract = await stakingFactory.deploy(this.erc20Token.address);
    await this.stakingContract.deployed();
    //console.log("Staking Contract Address: " + this.stakingContract.address);
  });

  it("Check my balance 1000 tokens", async function () {
    const [me, bob, steve] = await ethers.getSigners();

    const balance = await this.erc20Token.balanceOf(me.address);
    this.erc20Token.transfer(bob.address, 200);
    this.erc20Token.transfer(steve.address, 300);

    expect(balance).to.equal(2000000);
    expect(await this.erc20Token.balanceOf(me.address)).to.equal(1999500);
    expect(await this.erc20Token.balanceOf(bob.address)).to.equal(200);
    expect(await this.erc20Token.balanceOf(steve.address)).to.equal(300);
  });

  it("_irec20 same address Staking Contract", async function () {
    expect(await this.stakingContract._ierc20()).to.equal(
      this.erc20Token.address
    );
  });

  it("Allowance Staking Contract to 1000000 tokens", async function () {
    const [me, bob, steve] = await ethers.getSigners();

    const allowanceBefore = await this.erc20Token.allowance(
      me.address,
      this.stakingContract.address
    );
    expect(allowanceBefore).to.equal(0);

    await this.erc20Token.approve(this.stakingContract.address, 2000000);

    const allowanceNow = await this.erc20Token.allowance(
      me.address,
      this.stakingContract.address
    );
    expect(allowanceNow).to.equal(2000000);
  });
  describe("Reward", function () {
    it("Only owner can approve to add a reward", async function () {
        const [me, bob, steve] = await ethers.getSigners();
    
        await expect(
            this.stakingContract.connect(bob).approveReward(steve.address, 1000)
        ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("Approve Reward of 200 tokens to me", async function () {
      const [me, bob, steve] = await ethers.getSigners();

      const reward = 2000000;
      await this.stakingContract.approveReward(me.address, reward);
      expect(await this.erc20Token.balanceOf(me.address)).to.equal(1999500);
    });

    it("Add Reward 100 tokens to Staking Contract", async function () {
      const [me, bob, steve] = await ethers.getSigners();

      await this.stakingContract.connect(me).addReward(100);

      expect(await this.erc20Token.balanceOf(me.address)).to.equal(1999400);
      expect(await this.stakingContract.rewardTotal()).to.equal(100);
    });
  });

  describe("Duration", function () {
    // 1 week = 604.800 sec
    it("Default duration 4 weeks", async function () {
      expect(await this.stakingContract.getDuration()).to.equal(2419200);
    });
    it("Set duration bob, 3 weeks", async function () {
      const [me, bob, steve] = await ethers.getSigners();

      await expect(
        this.stakingContract.connect(bob).setDuration(1814400)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("Set duration me, 3 weeks", async function () {
      await this.stakingContract.setDuration(1814400);

      expect(await this.stakingContract.getDuration()).to.equal(1814400);
    });
    it("Set duration less than 1 week", async function () {
      await expect(this.stakingContract.setDuration(100000)).to.be.rejectedWith(
        "Duration should be at least 1 week."
      );
    });
  });

  describe("Deposit", function () {
    // Duration now: 3 weeks
    // Total Reward: 100

    it("Balance Of me before deposit", async function () {
      const [me, bob, steve] = await ethers.getSigners();

      expect(await this.stakingContract.balanceOf(me.address)).to.equal(0);
    });

    // My first deposit
    // _balances[_msgSender()] (me) = 0
    // _msgSender() = me
    it("Last Deposit Time of me should be 0", async function () {
      const [me, bob, steve] = await ethers.getSigners();

      expect(await this.stakingContract.lastDepositTime(me.address)).to.equal(
        0
      );
    });

    it("Deposit 80, balance should be 80", async function () {
      const [me, bob, steve] = await ethers.getSigners();

      await this.stakingContract.deposit(80);

      expect(await this.stakingContract.balanceOf(me.address)).to.equal(80);
      // 100 Reward + 80 Deposit
      expect(
        await this.erc20Token.balanceOf(this.stakingContract.address)
      ).to.equal(180);
    });

    it("Last Deposit Time should be greater than 0", async function () {
      const [me, bob, steve] = await ethers.getSigners();

      await this.stakingContract.deposit(2);

      expect(await this.stakingContract.balanceOf(me.address)).to.equal(82);
      expect(
        await this.stakingContract.lastDepositTime(me.address)
      ).to.be.greaterThan(0);
    });

    it("Deposit 1900000 revert with Not enough token to pay 2% reward", async function () {
      const [me, bob, steve] = await ethers.getSigners();

      await expect(this.stakingContract.deposit(1900000)).to.be.revertedWith(
        "Not enough token to pay 2% reward."
      );
    });
  });

  describe("Withdraw", function () {
    it("Withdraw before contract duration (less than 3 weeks)", async function () {
      await expect(this.stakingContract.withdraw()).to.be.revertedWith(
        "Staking period is not over."
      );
    });
    it("Withdraw after 32 weeks", async function () {
      const [me, bob, steve] = await ethers.getSigners();

      const nWeeks = 60 * 60 * 24 * 7 * 32;
      // 32 weeks = 2419200 sec
      const myDeposit = await this.stakingContract.balanceOf(me.address);
      // 80 + 2 = 82
      const percentage = (await this.stakingContract._percentReward()) / 100;
      // 2 / 100 = 0.02
      const stakingContractDuration = await this.stakingContract.getDuration();
      // 3 weeks = 1814400 sec
      const reward = Math.floor(
        (myDeposit * percentage * nWeeks) / stakingContractDuration
      );
      // 82 * 0.02 * 2419200 / 1814400 = 17

      const totalReward = parseInt(reward) + parseInt(myDeposit);
      // 17 + 82 = 99

      const totalBalanceAddReward =
        parseInt(await this.erc20Token.balanceOf(me.address)) +
        parseInt(totalReward);
      // 1999318 + 99 = 1999417

      //   const blockNumBefore = await ethers.provider.getBlockNumber();
      //   const blockBefore = await ethers.provider.getBlock(blockNumBefore);
      //   const timestampBefore = blockBefore.timestamp;

      //   console.log("Block number before: " + blockNumBefore);
      //   console.log("Timestamp before: " + timestampBefore);

      await ethers.provider.send("evm_increaseTime", [nWeeks]);
      await ethers.provider.send("evm_mine");

      //   const blockNumAfter = await ethers.provider.getBlockNumber();
      //   const blockAfter = await ethers.provider.getBlock(blockNumAfter);
      //   const timestampAfter = blockAfter.timestamp;

      //   console.log("Block number after: " + blockNumAfter);
      //   console.log("Timestamp after: " + timestampAfter);
      //   console.log("Timestamp diff: " + (timestampAfter - timestampBefore));

      await this.stakingContract.withdraw();

      expect(await this.erc20Token.balanceOf(me.address)).to.equal(
        totalBalanceAddReward
      );

      expect(await this.stakingContract.balanceOf(me.address)).to.equal(0);
      
      expect(await this.stakingContract.rewardTotal()).to.equal(83);
      // 100 - 17 = 83
      expect(
        await this.erc20Token.balanceOf(this.stakingContract.address)
      ).to.equal(83);
      // 182 - 82 - 17 = 83
    });
  });
});
