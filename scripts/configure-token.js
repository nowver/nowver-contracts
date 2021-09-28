const hre = require('hardhat');

const main = async () => {
  const [deployer] = await hre.ethers.getSigners();
  console.log(`deployer ${deployer}`)
  const nowver = await hre.deployments.get('Nowver')
  console.log(`${nowver}`)
  throw new Error("throw error run script");
  const usdc = await deployUsdc(admin);
  console.log(
    `USDC contract deployed at ${usdc.address} - Minter account: ${admin.address}`
  );
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
