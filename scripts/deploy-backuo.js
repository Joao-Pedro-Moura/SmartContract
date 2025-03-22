const hre = require("hardhat");

async function main() {
  // Definição dos argumentos para o construtor do contrato
  const contratado = "0x304C8A70BEFa2E4bf844fA693f8aE7B0De8b5417";  // Endereço Ethereum válido
  const dataInicio = Math.floor(Date.now() / 1000) + 60;  // Início em 1 minuto
  const dataFim = dataInicio + (20 * 60);  // Adiciona 20 minutos (20 * 60 segundos)
  const valorPorPF = 1000;  // Valor por PF

  // Obtendo o contrato compilado
  const SmartPayment = await hre.ethers.getContractFactory("SmartPayment");

  // Implantando o contrato (o método 'deploy' agora pode ser await diretamente)
  const contrato = await SmartPayment.deploy(
    contratado,
    dataInicio,
    dataFim,
    valorPorPF
  );

  // Esperando a implantação ser confirmada na blockchain
  await contrato.waitForDeployment();

  console.log(`Novo contrato implantado no endereço: ${await contrato.getAddress()}`);
}

// Chamando a função principal e tratando erros
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Erro ao implantar contrato:", error);
    process.exit(1);
  });
