//00_deploy_nowver.js
module.exports = async function ({getNamedAccounts, deployments}) {
  const {deploy, log, execute} = deployments;
  let {deployer} = await getNamedAccounts();
  const contractName = 'Nowver';

  log(`Deploying ${contractName} from deployer ${deployer}`);

  const metadataBaseURI = "https://bafybeihikqchaf2qonipwy4wmcxj375fxco7f2qp5e4e3f3dygbu223pxq.ipfs.dweb.link/";

  const deployResult = await deploy(contractName, {
    from: deployer,
    contract: contractName,
    args: [metadataBaseURI]
  });
  if (deployResult.newlyDeployed) {
    log(
      `contract ${contractName} deployed at ${deployResult.address} using ${deployResult.receipt.gasUsed} gas`
    );
    log(
      `transaction hash: ${deployResult.receipt.transactionHash}, block number: ${deployResult.receipt.blockNumber}`
    );
  }
};

module.exports.tags = ['Nowver'];
