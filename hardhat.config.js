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

task('nowver-uri', "Updated the contract's metadata URI to the provided URI")
  .addParam('uri', 'new metadata URI, ipfs hash or api url')
  .setAction(async ({uri}) => {
    console.log(`get deployer signer`);
    const [deployer] = await hre.ethers.getSigners();
    console.log(`calling setUri from deployer ${deployer}`);

    console.log(`get nowver deployment`);
    const nowver = await hre.deployments.get('Nowver');
    console.log(`nowver address ${nowver.address}`);

    console.log(`URI: ${uri}`)
  });

const MUMBAI_RPC = 'https://rpc-mumbai.matic.today';
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
    hardhat: {},
    mumbai: {
      url: MUMBAI_RPC,
      accounts: {
        mnemonic: DEV_MNEMONIC,
      },
      saveDeployments: true,
      // blockGasLimit: 20000000,
      // gasPrice: 1000000000,
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
      default: 0,
    },
  },
  paths: {
    deploy: 'deploy',
    deployments: 'deployments',
    imports: 'imports',
  },
};
