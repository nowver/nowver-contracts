const chai = require('chai');
chai.use(hre.waffle.solidity);

const {expect} = chai;
const {ethers} = require('ethers');
const {getNamedAccounts} = require('hardhat');

const metadataBaseURI =
  'https://bafybeihikqchaf2qonipwy4wmcxj375fxco7f2qp5e4e3f3dygbu223pxq.ipfs.dweb.link/';
const contractName = 'Nowver';
const revertMessages = {
  MINT_TOKEN_DONT_EXIST: "Nowver: token doesn't exist",
  MINT_TOKEN_OUT_OF_BONDS: 'Nowver: out of bonds',
  REGISTER_ALREADY_EXISTS: 'Nowver: token already registered',
  REGISTER_INCORRECT_SUPPLY: 'Nowver: supply must be greater than 0',
  OWNABLE_NOT_OWNER: 'Ownable: caller is not the owner',
};

/// @notice setupTest is a help method that creates a fixture containing the deployer account
/// (i.e. the owner of the contract) and the instance of the deployed contract
/// @dev setupTest should be called before each test
const setupTest = deployments.createFixture(
  async ({ethers, deployments, getNamedAccounts}, options) => {
    await deployments.fixture(['Nowver']); // ensure you start from a fresh deployments
    const {deployer, testUser} = await getNamedAccounts();

    const deployerSigner = await ethers.getSigner(deployer);
    const testUserSigner = await ethers.getSigner(testUser);

    const Nowver = await deployments.get(contractName);
    const NowverContract = new ethers.Contract(Nowver.address, Nowver.abi);
    const NowverAdmin = await NowverContract.connect(deployerSigner);
    const NowverUser = await NowverContract.connect(testUserSigner);

    return {
      deployer: {
        address: deployer,
        signer: deployerSigner,
        Nowver: NowverAdmin,
      },
      testUser: {
        address: testUser,
        signer: testUserSigner,
        Nowver: NowverUser,
      },
    };
  }
);

describe(contractName, () => {
  it('should have a correct metadata URI after deployment', async function () {
    const {deployer} = await setupTest();

    const uri = await deployer.Nowver.metadataBaseURI();
    expect(uri).to.equal(metadataBaseURI);
  });

  it('should be able to update the metadataBaseURI by the owner', async function () {
    const {deployer, testUser} = await setupTest();

    const uriToSet = 'ipfs://SOMECID';

    // calling setURI from the owner account
    const tx = deployer.Nowver.setURI(uriToSet);
    await expect(tx).not.to.be.reverted;

    const newURI = await deployer.Nowver.metadataBaseURI();
    expect(newURI).to.equal(uriToSet);

    // non-owner address can't use setURI
    const tx2 = testUser.Nowver.setURI(metadataBaseURI);
    await expect(tx2).to.be.revertedWith(revertMessages.OWNABLE_NOT_OWNER);
  });

  it('should not have any registered token after deployment', async function () {
    const {deployer} = await setupTest();

    const count = await deployer.Nowver.tokensCount();
    expect(count).to.equal(0);
  });

  it('should be pausable and un-pausable by the owner', async function () {
    const {deployer, testUser} = await setupTest();

    // calling pause with a non-owner address
    const tx = testUser.Nowver.pause();
    await expect(tx).to.be.revertedWith(revertMessages.OWNABLE_NOT_OWNER);

    // calling pause with the owner address
    const tx2 = deployer.Nowver.pause();
    await expect(tx2).not.to.be.reverted;

    const pausedStatus = await deployer.Nowver.paused();
    expect(pausedStatus).to.be.true;

    // calling unpause with a non-owner address
    const tx3 = testUser.Nowver.unpause();
    await expect(tx3).to.be.revertedWith(revertMessages.OWNABLE_NOT_OWNER);

    // calling unpause with the owner address
    const tx4 = deployer.Nowver.unpause();
    await expect(tx4).not.to.be.reverted;

    const unpausedStatus = await deployer.Nowver.paused();
    expect(unpausedStatus).to.be.false;
  });

  it('should have initial zero balance', async function () {
    const {deployer, testUser} = await setupTest();

    expect(await deployer.Nowver.balanceOf(deployer.address, 1)).to.equal(0);
    expect(await testUser.Nowver.balanceOf(testUser.address, 1)).to.equal(0);
  });

  it('should be able to register tokens by the owner', async function () {
    const {deployer, testUser} = await setupTest();
    const price = ethers.utils.parseEther('0.01');

    // calling registerToken from a non-owner account
    const tx = testUser.Nowver.registerToken(1, 50, price);
    await expect(tx).to.be.revertedWith(revertMessages.OWNABLE_NOT_OWNER);

    // calling registerToken with the owner account
    const tx2 = deployer.Nowver.registerToken(1, 50, price);
    await expect(tx2).not.to.be.reverted;
  });

  it('should not be able to register tokens with 0 supply', async function () {
    const {deployer} = await setupTest();
    const price = ethers.utils.parseEther('0.01');

    // registering token id 1 with 0 supply, will revert
    const tx = deployer.Nowver.registerToken(1, 0, price);
    await expect(tx).to.be.revertedWith(
      revertMessages.REGISTER_INCORRECT_SUPPLY
    );
  });

  it('should be able to register multiple tokens with deployer account', async function () {
    const {deployer} = await setupTest();
    const price = ethers.utils.parseEther('0.01');

    // registering token id 1 with 50 supply, will revert
    const tx1 = deployer.Nowver.registerToken(1, 50, price);
    await expect(tx1).not.to.be.reverted;

    // tokensCount should have been incremented
    const count1 = await deployer.Nowver.tokensCount();
    expect(count1).to.equal(1);

    // registering token id 2 with 100 supply, will revert
    const tx2 = deployer.Nowver.registerToken(2, 100, price);
    await expect(tx2).not.to.be.reverted;

    // tokensCount should have been incremented again
    const count2 = await deployer.Nowver.tokensCount();
    expect(count2).to.equal(2);
  });

  it('should be able to mint a token in exchange of tMatic tokens and transfer it', async function () {
    const {deployer, testUser} = await setupTest();
    const price = ethers.utils.parseEther('0.01');

    // registering token id 1 with 50 supply, will revert
    const tx1 = deployer.Nowver.registerToken(1, 50, price);
    await expect(tx1).not.to.be.reverted;

    const provider = deployer.signer.provider;

    // check the contract balance and user balance before minting
    let contractBalanceBefore = ethers.BigNumber.from(
      await provider.getBalance(deployer.Nowver.address)
    );
    const userBalanceBefore = ethers.BigNumber.from(
      await provider.getBalance(testUser.address)
    );
    expect(contractBalanceBefore).to.equal(ethers.BigNumber.from(0));
    expect(userBalanceBefore - price).to.greaterThan(0);

    // buying token 3 for testUser
    let overrides = {
      value: price,
    };
    const tx2 = testUser.Nowver.mint(1, overrides);
    await expect(tx2).not.to.be.reverted;

    // checking the balance of testUser and contract after mint
    const contractBalanceAfter = ethers.BigNumber.from(
      await provider.getBalance(deployer.Nowver.address)
    );
    const userBalanceAfter = ethers.BigNumber.from(
      await provider.getBalance(testUser.address)
    );
    expect(contractBalanceAfter).to.equal(price);

    // checking the balance of token 1 for testUser after mint, should equal 1
    expect(await testUser.Nowver.balanceOf(testUser.address, 1)).to.equal(1);

    // transfer the token from testUser to deployer
    const tx3 = testUser.Nowver.safeTransferFrom(
      testUser.address,
      deployer.address,
      ethers.BigNumber.from(1),
      ethers.BigNumber.from(1),
      0x0
    );
    await expect(tx3).not.to.be.reverted;
    // checking the balance of token 1 for testUser after transfer, should equal 0
    expect(await testUser.Nowver.balanceOf(testUser.address, 1)).to.equal(0);
    // checking the balance of token 1 for deployer after transfer, should equal 1
    expect(await deployer.Nowver.balanceOf(deployer.address, 1)).to.equal(1);
  });
});
