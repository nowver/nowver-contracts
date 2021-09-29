const {count} = require('console');
const {ethers} = require('ethers');

require('hardhat-deploy');
require('@nomiclabs/hardhat-ethers');
require('@nomiclabs/hardhat-waffle');
require('@openzeppelin/hardhat-upgrades');

task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task('set-uri', "Updated the contract's metadata URI to the provided URI")
  .addParam('uri', 'new metadata URI, ipfs hash or api url')
  .setAction(async ({uri}) => {
    const {deployer} = hre.getNamedAccounts();
    const deployerSigner = await ethers.getSigner(deployer);
    const Nowver = await deployments.get('Nowver');
    const nowver = new ethers.Contract(Nowver.address, Nowver.abi).connect(
      deployerSigner
    );

    const tx = await nowver.setUri(uri).then((tx) => tx.wait());
    console.log(`tx sent: ${tx.transactionHash}`);
  });

task('uri', "Updated the contract's metadata URI to the provided URI")
  .addParam('id', 'id of the token metadata to retrieve')
  .setAction(async ({id}) => {
    const [deployerSigner, testUserSigner] = await hre.ethers.getSigners();

    const Nowver = await deployments.get('Nowver');
    const nowver = new ethers.Contract(Nowver.address, Nowver.abi).connect(
      deployerSigner
    );

    const metadataBaseURI = await nowver.metadataBaseURI();
    console.log(`metadataBaseURI: ${metadataBaseURI}`);

    const uri = await nowver.uri(id);
    console.log(`uri: ${uri}`);
  });

task('register', 'Registers a new token with a limited supply')
  .addParam('id', 'uint256 id of the token to register')
  .addParam('supply', 'uint256 max supply for this token')
  .addParam('price', 'uint256 price for this token')
  .setAction(async ({id, supply, price}) => {
    const {deployer} = hre.getNamedAccounts();
    const deployerSigner = await hre.ethers.getSigner(deployer);
    const Nowver = await deployments.get('Nowver');
    const nowver = new ethers.Contract(Nowver.address, Nowver.abi).connect(
      deployerSigner
    );

    const tx = await nowver
      .registerToken(id, supply, price)
      .then((tx) => tx.wait());
    console.log(`tx sent: ${tx.transactionHash}`);
  });

task('mint', 'Mints a new token for a given token type')
  .addParam('id', 'uint256 id of the token to register')
  .addParam('count', 'uint256 number of tokens to mint')
  .setAction(async ({id, count}) => {
    const [deployerSigner, testUserSigner] = await hre.ethers.getSigners();

    const Nowver = await deployments.get('Nowver');
    const nowver = new hre.ethers.Contract(Nowver.address, Nowver.abi).connect(
      testUserSigner
    );

    let price = '10000000000';
    if (id > 2) {
      price = '10000000';
    }
    for (let i = 1; i <= count; i++) {
      try {
        const tx = await nowver
          .mint(id, {value: price})
          .then((tx) => tx.wait());
        console.log(`token id ${id} - count ${i} - tx ${tx.transactionHash}`);
      } catch (e) {
        console.error(`failed to mint token ${i}`);
        console.error(e);
      }
    }
  });

const MUMBAI_RPC =
  'https://polygon-mumbai.infura.io/v3/1ffba0d1c5974cb9a79370247af998a4';
const DEV_MNEMONIC = process.env.NOWVER_MNEMONIC || '';

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: '0.8.7',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  accounts: {
    mnemonic: DEV_MNEMONIC,
  },
  networks: {
    localhost: {},
    mumbai: {
      url: MUMBAI_RPC,
      accounts: {
        mnemonic: DEV_MNEMONIC,
      },
      saveDeployments: true,
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    testUser: {
      default: 1,
    },
  },
  paths: {
    deploy: 'deploy',
    deployments: 'deployments',
    imports: 'imports',
  },
};
