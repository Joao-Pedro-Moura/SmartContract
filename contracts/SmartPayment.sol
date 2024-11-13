// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

// Uncomment this line to use console.log
import "hardhat/console.sol";

contract SmartPayment {
    address public contratante;
    address public contratado;
    string public carteiraContratado;
    uint public dataInicio;
    uint public dataFim;
    uint public valorPorPF;
    bool public contratanteAssinou;
    bool public contratadoAssinou;
    enum StatusContrato { Pendente, Ativo, Concluido }
    StatusContrato public statusContrato;

    // Evento para monitorar as atualizações do contrato
    event ContratoCriado(
        address indexed contratante,
        address indexed contratado,
        uint dataInicio,
        uint dataFim,
        uint valorPorPF
    );

    event ContratoAssinado(address indexed assinante);

    event ContratoAtivado(uint dataAtivacao);

    modifier apenasContratante() {
        require(msg.sender == contratante, "Apenas o contratante pode realizar essa acao.");
        _;
    }

    modifier apenasContratado() {
        require(msg.sender == contratado, "Apenas o contratado pode realizar essa acao.");
        _;
    }

    modifier ambosAssinaram() {
        require(contratanteAssinou && contratadoAssinou, "Ambas as partes devem assinar o contrato.");
        _;
    }

    constructor(address _contratado, string memory _carteiraContratado, uint _dataInicio, uint _dataFim, uint _valorPorPF) {
        require(_contratado != address(0), "Endereco do contratado invalido");
        require(_dataInicio < _dataFim, "Data de inicio deve ser anterior a data final");
        
        contratante = msg.sender; // Quem cria o contrato é o contratante
        contratado = _contratado;
        carteiraContratado = _carteiraContratado;
        dataInicio = _dataInicio;
        dataFim = _dataFim;
        valorPorPF = _valorPorPF;
        statusContrato = StatusContrato.Pendente;

        emit ContratoCriado(contratante, contratado, dataInicio, dataFim, valorPorPF);
    }

    // Função para o contratante assinar o contrato
    function assinarContratoContratante() public apenasContratante {
        require(!contratanteAssinou, "Contratante ja assinou o contrato.");
        contratanteAssinou = true;
        emit ContratoAssinado(msg.sender);
    }

    // Função para o contratado assinar o contrato
    function assinarContratoContratado() public apenasContratado {
        require(!contratadoAssinou, "Contratado ja assinou o contrato.");
        contratadoAssinou = true;
        emit ContratoAssinado(msg.sender);
    }

    // Função para ativar o contrato quando ambas as partes tiverem assinado
    function ativarContrato() public ambosAssinaram {
        require(block.timestamp >= dataInicio, "Contrato nao pode ser ativado antes da data de inicio.");
        require(statusContrato == StatusContrato.Pendente, "Contrato ja esta ativo ou concluido.");

        statusContrato = StatusContrato.Ativo;
        emit ContratoAtivado(block.timestamp);
    }

    // Função para verificar se o contrato pode ser finalizado
    function finalizarContrato() public apenasContratante {
        require(block.timestamp >= dataFim, "Contrato ainda nao atingiu a data final.");
        require(statusContrato == StatusContrato.Ativo, "Contrato deve estar ativo para ser finalizado.");

        statusContrato = StatusContrato.Concluido;
    }

    // Função para o analista enviar a pontuação da demanda e efetuar o pagamento
    function registrarPontuacao(uint pontuacao) external apenasContratante {
        require(statusContrato == StatusContrato.Ativo, "O contrato nao esta ativo");

        uint pagamento = pontuacao * valorPorPF; // Calcula o valor a ser pago com base na pontuação e no valorPorPF
        payable(contratado).transfer(pagamento); // Transfere o pagamento para o contratado
    }

    // Permitir que o contrato receba ETH para os pagamentos
    receive() external payable {}

    // Função para visualizar o saldo da carteira do contratado
    function saldoContratado() external view returns (uint) {
        return contratado.balance; // Retorna o saldo da carteira do contratado em wei
    }

    // Função para visualizar o saldo disponível no contrato
    function saldoContrato() external view returns (uint) {
        return address(this).balance; // Retorna o saldo do contrato
    }

}
