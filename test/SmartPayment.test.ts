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
      const carteiraContratado = "0x1234567890abcdef";
      const dataInicio = Math.floor(Date.now() / 1000); // Timestamp atual
      const dataFim = dataInicio + 30 * 24 * 60 * 60; // 30 dias após o início
      const valorPorPF = 1000; // Valor de 1 ETH por PF

      // Deploy do contrato com os parâmetros do construtor
      const SmartPayment = await ethers.getContractFactory("SmartPayment");
      const contrato = await SmartPayment.deploy(
          contratado.address,
          carteiraContratado,
          dataInicio,
          dataFim,
          valorPorPF
      );

      console.log("Contrato implantado em:", contrato.address);

    return { contrato, carteiraContratado, dataInicio, dataFim, valorPorPF, owner, contratado };
  }

  describe("SmartPayment", function () {
    it("Deve configurar o contrato corretamente", async function () {
      const { contrato, carteiraContratado, dataInicio, dataFim, valorPorPF, owner, contratado } = await loadFixture(deployFixture);

      // Verificações para garantir que o contrato foi inicializado corretamente
      expect(await contrato.contratante()).to.equal(owner.address);
      expect(await contrato.contratado()).to.equal(contratado.address);
      expect(await contrato.carteiraContratado()).to.equal(carteiraContratado);
      expect(await contrato.dataInicio()).to.equal(dataInicio);
      expect(await contrato.dataFim()).to.equal(dataFim);
      expect(await contrato.valorPorPF()).to.equal(valorPorPF);
    });
  });

  describe("Função assinarContratoContratante", function () {
    it("Deve permitir que o contratante assine o contrato", async function () {
      const { contrato, owner } = await loadFixture(deployFixture);

      // Contratante assina o contrato
      await contrato.connect(owner).assinarContratoContratante();

      // Verifica se o contratante assinou
      const contratanteAssinou = await contrato.contratanteAssinou();
      expect(contratanteAssinou).to.equal(true);
    });

    it("Deve falhar se alguém que não seja o contratante tentar assinar", async function () {
      const { contrato, contratado } = await loadFixture(deployFixture);

      // Tenta assinar com o contratado (não autorizado)
      await expect(
        contrato.connect(contratado).assinarContratoContratante()
      ).to.be.revertedWith("Apenas o contratante pode realizar essa acao.");
    });
  });

  describe("Função assinarContratoContratado", function () {
    it("Deve permitir que o contratado assine o contrato", async function () {
      const { contrato, contratado } = await loadFixture(deployFixture);

      // Contratado assina o contrato
      await contrato.connect(contratado).assinarContratoContratado();

      // Verifica se o contratado assinou
      const contratadoAssinou = await contrato.contratadoAssinou();
      expect(contratadoAssinou).to.equal(true);
    });

    it("Deve falhar se alguém que não seja o contratado tentar assinar", async function () {
      const { contrato, owner } = await loadFixture(deployFixture);

      // Tenta assinar com o contratante (não autorizado)
      await expect(
        contrato.connect(owner).assinarContratoContratado()
      ).to.be.revertedWith("Apenas o contratado pode realizar essa acao.");
    });
  });

  describe("Função ativarContrato", function () {
    it("Deve ativar o contrato quando ambas as partes tiverem assinado", async function () {
      const { contrato, owner, contratado } = await loadFixture(deployFixture);

      // Contratante e contratado assinam o contrato
      await contrato.connect(owner).assinarContratoContratante();
      await contrato.connect(contratado).assinarContratoContratado();

      // Ativa o contrato
      await contrato.ativarContrato();

      // Verifica se o contrato está ativo
      const statusContrato = await contrato.statusContrato();
      expect(statusContrato).to.equal(1); // StatusContrato.Ativo
    });

    it("Deve falhar ao ativar o contrato antes que ambas as partes assinem", async function () {
      const { contrato, owner } = await loadFixture(deployFixture);

      // Apenas o contratante assina
      await contrato.connect(owner).assinarContratoContratante();

      // Tenta ativar o contrato sem a assinatura do contratado
      await expect(contrato.ativarContrato()).to.be.revertedWith("Ambas as partes devem assinar o contrato.");
    });
  });
});