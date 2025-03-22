import json
import subprocess
from web3 import Web3
import time

# === 1. COMPILAR O CONTRATO USANDO HARDHAT ===
hardhat_path = "smartContract"
print("⏳ Compilando o contrato com Hardhat...")
try:
    subprocess.run(["npx", "hardhat", "compile"], check=True, cwd=hardhat_path)
    print("✅ Compilação concluída!")
except subprocess.CalledProcessError as e:
    print("❌ Erro ao compilar o contrato:", e)
    exit(1)

# === 2. COPIAR O ABI E BYTECODE DO HARDHAT ===
contract_path = "smartContract/artifacts/contracts/SmartPayment.sol/SmartPayment.json"
output_path = "smartContract/scripts/contract_info.json"

try:
    with open(contract_path, "r") as file:
        contract_data = json.load(file)

    with open(output_path, "w") as file:
        json.dump(contract_data, file, indent=4)

    print("✅ ABI e Bytecode copiados para:", output_path)
except Exception as e:
    print("❌ Erro ao copiar ABI e Bytecode:", e)
    exit(1)

# === 3. CONECTAR AO GANACHE ===
ganache_url = "http://127.0.0.1:7545"
web3 = Web3(Web3.HTTPProvider(ganache_url))

if not web3.is_connected():
    print("❌ Falha ao conectar ao Ganache. Certifique-se de que o Ganache está rodando.")
    exit(1)

print("✅ Conectado ao Ganache!")

# === 4. CARREGAR O CONTRATO E PREPARAR O DEPLOY ===
with open(output_path, "r") as file:
    contract_data = json.load(file)

abi = contract_data["abi"]
bytecode = contract_data["bytecode"]

# Criar a instância do contrato
SmartPayment = web3.eth.contract(abi=abi, bytecode=bytecode)

# === 5. DEFINIR OS PARÂMETROS DO CONTRATO ===
contratante = web3.eth.accounts[0]
contratado = web3.eth.accounts[1]
data_inicio = int(time.time())
data_fim = data_inicio + (30 * 24 * 60 * 60)
valor_por_pf = 100
gas_limit = 3000000

print("🚀 Implantando contrato...")
try:
    tx_hash = SmartPayment.constructor(contratado, data_inicio, data_fim, valor_por_pf).transact({
        'from': contratante,
        'gas': gas_limit
    })
    tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)

    contract_address = tx_receipt.contractAddress
    print(f"✅ Contrato implantado com sucesso no endereço: {contract_address}")

    # Salvar informações do contrato
    with open("contract_info.json", "w") as f:
        json.dump({"address": contract_address, "abi": abi}, f, indent=4)

except Exception as e:
    print(f"❌ Erro ao implantar contrato: {e}")
    exit(1)

print("🎉 Processo concluído com sucesso!")
