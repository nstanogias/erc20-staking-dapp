# ERC20 Staking App

## Introduction

This example demonstrates a use of several thirdweb tools to create an ERC20 Staking application. In this example, users can stake their ERC20 tokens and earn ERC20 tokens (same or different) as a reward. It combines:

1. [thirdweb's Token Drop Contract](https://portal.thirdweb.com/pre-built-contracts/token-drop)
2. [thirdweb's Token Contract](https://portal.thirdweb.com/pre-built-contracts/token)
3. A modified version of this [Erc20 Staking Smart Contract](https://solidity-by-example.org/defi/staking-rewards) by [solidity-by-example](https://solidity-by-example.org/defi/staking-rewards)

We deploy the ERC20 Staking Smart contract using [thirdweb deploy](https://portal.thirdweb.com/thirdweb-deploy) and interact with all three of the contracts using the thirdweb [TypeScript](https://portal.thirdweb.com/typescript) and [React](https://portal.thirdweb.com/react) SDKs.

**Check out the Demo here**: TBD

## Tools

- [**thirdweb Deploy**](https://portal.thirdweb.com/thirdweb-deploy): Deploy our `StakingContract.sol` smart contract with zero configuration by running `npx thirdweb deploy`.
- [**thirdweb React SDK**](https://docs.thirdweb.com/react): to enable users to connect and disconnect their wallets with our website, and interact with our smart contracts using hooks like [useTokenDrop](https://portal.thirdweb.com/react/react.usetoken), [useToken](https://portal.thirdweb.com/react/react.usetoken), and [useContract](https://portal.thirdweb.com/react/react.usecontract).

## Using This Repo

- Create a copy of this repo by running the below command:

```bash
npx create-tw-app --example erc20-staking-app
```

- Deploy the `ERC20Staking.sol` smart contract by running the below command from the root of the project directory:

```bash
npx thirdweb deploy
```

- Configure the network you deployed in [`index.js`](./src/index.js):

```jsx
// This is the chainId your dApp will work on.
const activeChainId = ChainId.Rinkeby;
```

- Run the project locally:

```bash
npm run dev
```

# Guide

In this section, we'll dive into the code and explain how it works.

## ERC20 Staking Smart Contract

The ERC20 Staking contract in [ERC20Staking.sol](/ERC20Staking.sol) can be broken down into three parts:

1. Staking
2. Withdrawing
3. Rewards

### Staking

ERC20 tokens can be staked by users to earn rewards, and are held by the smart contract until the user withdraws them.
Before users can stake tokens, they need to buy some. There are two different erc20 tokens:

1. Nikos Tokens (NTOK)
2. Comunity Gaming Tokens (CGTOK)

Users can buy and stake NTOK and they are rewared by the smart contract with CGTOK.

When the user calls the `stake` function on the smart contract, they smart contract transfers NTOK tokens from their wallet to the contract:

```solidity
        // Transfer tokens from the wallet to the Smart contract
        s_stakingToken.transferFrom(msg.sender, address(this), amount);
```
