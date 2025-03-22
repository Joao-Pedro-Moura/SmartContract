import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";
import { ethers } from "hardhat";

describe("SmartPayment", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {

    // Contracts are deployed using the first signer/account by default
      const [owner, contratado] = await ethers.getSigners();

      // Parâmetros para o construtor
      const dataInicio = Math.floor(Date.now() / 1000); // Timestamp atual
      const dataFim = dataInicio + 30 * 24 * 60 * 60; // 30 dias após o início
      const valorPorPF = 1000; // Valor de 1 ETH por PF

      // Deploy do contrato com os parâmetros do construtor
      const SmartPayment = await ethers.getContractFactory("SmartPayment");
      const contrato = await SmartPayment.deploy(
          contratado.address,
          dataInicio,
          dataFim,
          valorPorPF
      );

      await contrato.waitForDeployment(); // Aguarde o deploy ser confirmado

    console.log("Contrato implantado em:", await contrato.getAddress());

    return { contrato, owner, contratado, dataInicio, dataFim, valorPorPF };
  }

  describe("SmartPayment", function () {
    it("Deve configurar o contrato corretamente", async function () {
      const { contrato, owner, contratado, dataInicio, dataFim, valorPorPF } = await loadFixture(deployFixture);

      // Verificações para garantir que o contrato foi inicializado corretamente
      expect(await contrato.contratante()).to.equal(owner.address);
      expect(await contrato.contratado()).to.equal(contratado.address);
      expect(await contrato.dataInicio()).to.equal(dataInicio);
      expect(await contrato.dataFim()).to.equal(dataFim);
      expect(await contrato.valorPorPF()).to.equal(valorPorPF);
    });
  });
});
