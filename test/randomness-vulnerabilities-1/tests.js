const {ethers} = require("hardhat");
const {expect} = require("chai");
const {TASK_CLEAN_GLOBAL} = require("hardhat/builtin-tasks/task-names");

describe("Randomness Vulnerabilites Exercise 1", function () {
  let deployer, attacker;
  const GAME_POT = ethers.utils.parseEther("10"); // 10 ETH

  before(async function () {
    /** SETUP EXERCISE - DON'T CHANGE ANYTHING HERE */

    [deployer, attacker] = await ethers.getSigners();
    this.attackerInitialBalance = await ethers.provider.getBalance(attacker.address);

    // Deploy wallet and deposit 100 ETH
    const gameFactory = await ethers.getContractFactory(
      "contracts/randomness-vulnerabilities-1/Game.sol:Game",
      deployer
    );
    this.game = await gameFactory.deploy({value: GAME_POT});

    let inGame = await ethers.provider.getBalance(this.game.address);
    expect(inGame).to.equal(GAME_POT);
  });

  it("Exploit", async function () {
    /** CODE YOUR SOLUTION HERE */
    // getting timestamp
    const AttackGameFactory = await ethers.getContractFactory(
      "contracts/randomness-vulnerabilities-1/AttackGame.sol:AttackGame",
      deployer
    );

    this.attackGame = await AttackGameFactory.connect(attacker).deploy(this.game.address);
    await this.attackGame.exploitGame();
  });

  after(async function () {
    /** SUCCESS CONDITIONS */
    // Game funds were stolen
    expect(await ethers.provider.getBalance(this.game.address)).to.equal(0);
    // Attacker supposed to own the stolen ETH (-0.2 ETH for gas...)
    expect(await ethers.provider.getBalance(attacker.address)).to.be.gt(
      this.attackerInitialBalance.add(GAME_POT).sub(ethers.utils.parseEther("0.2"))
    );
  });
});
