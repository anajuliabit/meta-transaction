# ERC20 Meta Transaciton with Biconomy

This project demonstrates a meta transaction ERC20 contract to enable gas less transactions using Open Gas Station and Biconomy SDK.

The contract is using [EIP-2771](https://eips.ethereum.org/EIPS/eip-2771) approach.

More info about the SDK: [Biconomy doc](https://docs.biconomy.io/products/enable-gasless-transactions/eip-2771)

Contract address (Rinkeby) - [0x8ae9a8808ac05460d099edc84954f2ad5116ee4e](https://rinkeby.etherscan.io/address/0x8ae9a8808ac05460d099edc84954f2ad5116ee4e)

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
npx hardhat help
REPORT_GAS=true npx hardhat test
npx hardhat coverage
npx hardhat run scripts/deploy.ts
TS_NODE_FILES=true npx ts-node scripts/deploy.ts
npx eslint '**/*.{js,ts}'
npx eslint '**/*.{js,ts}' --fix
npx prettier '**/*.{json,sol,md}' --check
npx prettier '**/*.{json,sol,md}' --write
npx solhint 'contracts/**/*.sol'
npx solhint 'contracts/**/*.sol' --fix
```
