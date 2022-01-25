import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: "0.8.11",
  networks: {
    rinkeby: {
      url: process.env.RINKEBY_URL,
      accounts: [
        process.env.PRIVATE_KEY_ADMINISTRATOR,
        process.env.PRIVATE_KEY_DONATOR1,
        process.env.PRIVATE_KEY_DONATOR2,
      ] as string[],
      gas: 2100000,
      gasPrice: 8000000000,
    },
    ropsten: {
      url: process.env.ROPSTEN_URL,
      accounts: [
        process.env.PRIVATE_KEY_ADMINISTRATOR,
        process.env.PRIVATE_KEY_DONATOR1,
        process.env.PRIVATE_KEY_DONATOR2,
      ] as string[],
      gas: 2100000,
      gasPrice: 8000000000,
    },
  },

  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  mocha: {
    timeout: 60000,
  },
};

export default config;
