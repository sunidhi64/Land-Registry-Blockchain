require('path');
//require('babel-polyfill');

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "1337" // Match any network id
    },
  },
  contracts_directory: './contracts/',
  contracts_build_directory: './client/src/contracts/',
  compilers: {
    solc: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}