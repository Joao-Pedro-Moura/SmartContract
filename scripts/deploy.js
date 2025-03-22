const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    // 🔹 Carregar as chaves do contratante do arquivo JSON
    const keysPath = path.join(__dirname, "../../SmartPayment/keys.json");
    
    if (!fs.existsSync(keysPath)) {
        console.error("❌ Arquivo keys.json não encontrado! Certifique-se de que está em SmartPayment/");
        process.exit(1);
    }

    const keys = JSON.parse(fs.readFileSync(keysPath, "utf8"));
    const privateKey = keys.contratante_private_key;

    if (!privateKey) {
        console.error("❌ Chave privada do contratante não informada no keys.json!");
        process.exit(1);
    }

    // Criar carteira do contratante
    const provider = new hre.ethers.JsonRpcProvider("http://127.0.0.1:7545"); // Ajuste se necessário
    const wallet = new hre.ethers.Wallet(privateKey, provider);

    console.log("📡 Conta do contratante (deployer):", wallet.address);

    const contratado = "0x304C8A70BEFa2E4bf844fA693f8aE7B0De8b5417";  
    const dataInicio = Math.floor(Date.now() / 1000) + 60;  
    const dataFim = dataInicio + (20 * 60);  
    const valorPorPF = 1000;

    // Obtendo o contrato compilado
    const SmartPayment = await hre.ethers.getContractFactory("SmartPayment", wallet);

    console.log("🚀 Implantando contrato...");
    const contrato = await SmartPayment.deploy(contratado, dataInicio, dataFim, valorPorPF);

    await contrato.waitForDeployment();

    const contractAddress = await contrato.getAddress();
    console.log(`✅ Novo contrato implantado no endereço: ${contractAddress}`);
}

// Chamando a função principal e tratando erros
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Erro ao implantar contrato:", error);
        process.exit(1);
    });
