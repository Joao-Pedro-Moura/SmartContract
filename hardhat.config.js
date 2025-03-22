require("@nomicfoundation/hardhat-ethers");

module.exports = {
  solidity: "0.8.27",
  networks: {
    localhost: {
      url: "http://127.0.0.1:7545" // Define a porta do Ganache
    }
  }
};

