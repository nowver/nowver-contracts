# Nowver NFT

This project is a basic Nowver NFT ERC1155 token. It comes with a NowverERC1155 contract, tests and deployment scripts.

## Install the dependencies

This project uses `npm` and `hardhat`
To install dependencies, run `npm install`

## Compiling the contract

To compile the contract, run `npx hardhat compile`.
To force the compilation, run `npx hardhat compile --force`

## Testing the contract

This contract comes with Unit Tests using Chai.
To run the tests, run `npx hardhat test --network localhost`

## Interacting with the contract from the CLI

Hardhat allows us to configure tasks that can be run in the hardhat CLI.

The following tasks have been declared:

- uri
- set-uri
- register
- mint

Tasks are configure in the [hardhat.config.js](./hardhart.config.js) file and can be listed using `npx hardhat help`:

```shell
npx hardhat help
Hardhat version 2.6.4

Usage: hardhat [GLOBAL OPTIONS] <TASK> [TASK OPTIONS]

GLOBAL OPTIONS:

  --config              A Hardhat config file.
  --emoji               Use emoji in messages.
  --help                Shows this message, or a task's help if its name is provided
  --max-memory          The maximum amount of memory that Hardhat can use.
  --network             The network to connect to.
  --show-stack-traces   Show stack traces.
  --tsconfig            Reserved hardhat argument -- Has no effect.
  --verbose             Enables Hardhat verbose logging
  --version             Shows hardhat's version.


AVAILABLE TASKS:

  accounts              Prints the list of accounts
  check                 Check whatever you need
  clean                 Clears the cache and deletes all artifacts
  compile               Compiles the entire project, building all artifacts
  console               Opens a hardhat console
  deploy                Deploy contracts
  etherscan-verify      submit contract source code to etherscan
  export                export contract deployment of the specified network into one file
  export-artifacts
  flatten               Flattens and prints contracts and their dependencies
  help                  Prints this message
  mint                  Mints a new token for a given token type
  node                  Starts a JSON-RPC server on top of Hardhat EVM
  register              Registers a new token with a limited supply
  run                   Runs a user-defined script after compiling the project
  set-uri               Updated the contract's metadata URI to the provided URI
  sourcify              submit contract source code to sourcify (https://sourcify.dev)
  test                  Runs mocha tests
  uri                   Updated the contract's metadata URI to the provided URI
```

## Deploying the contract

When using a local development node, you don't need any wallet to run the project.
When using a live Ethereum network (in our case, Polygon Mumbai testnet), we need to configure the two following variables in hardhat.config.js :

- const MUMBAI_RPC = 'https://polygon-mumbai.infura.io/v3/1ffba0d1c5974cb9a79370247af998a4';
- const DEV_MNEMONIC = process.env.NOWVER_MNEMONIC || '';

Then we can deploy the contract using the following command:

```shell
npx hardhat deploy --network mumbai

Nothing to compile
Deploying Nowver from deployer 0x20BfE90996ED4ce6382E75A85B3d6989D5Eaf814
contract Nowver deployed at 0xF1700F4A6acb9D32dfE2481572F5F71e9eC8482D using 2365280 gas
transaction hash: 0x11c1b26ab54210434d88386c9dd2a7529759a450f7a591706de5ae6cc8ccbcd7, block number: 19542421
```

We can also use the `--reset` flag to force deploying the contract again :

```shell
npx hardhat deploy --network mumbai --reset

Nothing to compile
Deploying Nowver from deployer 0x20BfE90996ED4ce6382E75A85B3d6989D5Eaf814
contract Nowver deployed at 0x6e1a05D4F3f87891CE7EFF1EaBA0684EF2b8b216 using 2365280 gas
transaction hash: 0x23df58a6563d842acbf13c5a4d4fbb5bc358233e2a7df73d104c2302b8cf4ab2, block number: 19542500
```

See the address of Nowver contract changed from `0xF1700F4A6acb9D32dfE2481572F5F71e9eC8482D` to `0x6e1a05D4F3f87891CE7EFF1EaBA0684EF2b8b216`
