//00_deploy_nowver.js
module.exports = async function ({getNamedAccounts, deployments}) {
  const {deploy, log, execute} = deployments;
  let {deployer} = await getNamedAccounts();
  const contractName = 'Nowver';

  log(`Deploying ${contractName} from deployer ${deployer}`);

  const deployResult = await deploy(contractName, {
    from: deployer,
    contract: contractName,
  });
  if (deployResult.newlyDeployed) {
    log(
      `contract ${contractName} deployed at ${deployResult.address} using ${deployResult.receipt.gasUsed} gas`
    );
    log(
      `transaction hash: ${deployResult.receipt.transactionHash}, block number: ${deployResult.receipt.blockNumber}`
    );
  } else {
    const oldAddress = await deployments.get(contractName);
    log(
      `contract ${contractName} not deployed, already exists at address ${oldAddress}`
    );
    log(`to deploy again, run 'npx hardhat deploy --tags nowver --reset'`);
  }
};

module.exports.tags = ['nowver'];
