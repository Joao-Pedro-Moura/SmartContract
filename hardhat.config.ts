import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.27",
  networks: {
    ganache: {
      url: "HTTP://127.0.0.1:7545",  // Endereço padrão do Ganache
      accounts: [
        "0xa9f40b988f54803f9e15a0ea88a90b64d12d1d0504fba38c15c630aaa2122cef",
        "0x2562004e43846330aaed2d822c9cd164dc238c3f4b8a761f8916e3fd406ed08f"
      ]
    }
  }
};

export default config;
