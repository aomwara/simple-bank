const config = require("./config.json");
const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  networks: {
    development: {
      host: config.ganacheHost,
      port: config.ganachePort,
      network_id: config.ganacheNetworkId,
    },

    kovan: {
      provider: () =>
        new HDWalletProvider(config.testerPrivateKey, config.liveHost),
      network_id: config.liveNetworkId,
    },
  },

  contracts_directory: "./contracts/",
  contracts_build_directory: "./abis/",
  compilers: {
    solc: {
      version: "0.7.6",
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: "petersburg",
    },
  },
};
