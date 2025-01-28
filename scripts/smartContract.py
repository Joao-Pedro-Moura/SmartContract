from flask import Flask, request, jsonify
from web3 import Web3
import json

app = Flask(__name__)

# Carregando configuração do contrato
with open("config.json") as config_file:
    config = json.load(config_file)

# Configuração da conexão com a blockchain de desenvolvimento (Ganache)
GANACHE_URL = config["ganache_url"]
web3 = Web3(Web3.HTTPProvider(GANACHE_URL))

# Verificar conexão com a blockchain
if not web3.is_connected():
    raise Exception("Falha na conexão com a blockchain Ganache")

# Carregar o contrato
CONTRACT_ADDRESS = config["contract_address"]
CONTRACT_ABI = config["contract_abi"]
contract = web3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)

@app.route('/sign_contract_contratante', methods=['POST'])
def sign_contract_contratante():
    try:
        data = request.json
        account = web3.eth.account.from_key(data['private_key'])
        tx = contract.functions.assinarContratoContratante().build_transaction({
            'from': account.address,
            'nonce': web3.eth.get_transaction_count(account.address),
            'gas': 1000000,
            'gasPrice': web3.to_wei('50', 'gwei')
        })

        signed_tx = web3.eth.account.sign_transaction(tx, private_key=data['private_key'])
        tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)
        return jsonify({"tx_hash": web3.to_hex(tx_hash)})

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/sign_contract_contratado', methods=['POST'])
def sign_contract_contratado():
    try:
        data = request.json
        account = web3.eth.account.from_key(data['private_key'])
        tx = contract.functions.assinarContratoContratado().build_transaction({
            'from': account.address,
            'nonce': web3.eth.get_transaction_count(account.address),
            'gas': 1000000,
            'gasPrice': web3.to_wei('50', 'gwei')
        })

        signed_tx = web3.eth.account.sign_transaction(tx, private_key=data['private_key'])
        tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)
        return jsonify({"tx_hash": web3.to_hex(tx_hash)})

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/activate_contract', methods=['POST'])
def activate_contract():
    try:
        data = request.json
        account = web3.eth.account.from_key(data['private_key'])
        tx = contract.functions.ativarContrato().build_transaction({
            'from': account.address,
            'nonce': web3.eth.get_transaction_count(account.address),
            'gas': 1000000,
            'gasPrice': web3.to_wei('50', 'gwei')
        })

        signed_tx = web3.eth.account.sign_transaction(tx, private_key=data['private_key'])
        tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)
        return jsonify({"tx_hash": web3.to_hex(tx_hash)})

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/finalize_contract', methods=['POST'])
def finalize_contract():
    try:
        data = request.json
        account = web3.eth.account.from_key(data['private_key'])
        tx = contract.functions.finalizarContrato().build_transaction({
            'from': account.address,
            'nonce': web3.eth.get_transaction_count(account.address),
            'gas': 1000000,
            'gasPrice': web3.to_wei('50', 'gwei')
        })

        signed_tx = web3.eth.account.sign_transaction(tx, private_key=data['private_key'])
        tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)
        return jsonify({"tx_hash": web3.to_hex(tx_hash)})

    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
