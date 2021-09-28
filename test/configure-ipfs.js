const hre = require('hardhat');

const main = async ({deployments}) => {
  const [deployer] = await hre.ethers.getSigners();
  console.log(`deployer ${deployer}`)
  const nowver = await deployments.get('Nowver')
  console.log(`${nowver}`)
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
