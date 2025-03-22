// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract SmartPayment {
    address public contratante;
    address public contratado;
    uint public dataInicio;
    uint public dataFim;
    uint public valorPorPF;
    uint public totalPontos;
    uint public totalPago;
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

    event PagamentoRealizado(address indexed contratado, uint pontos, uint valorPago);

    event ContratoFinalizado(uint dataFinalizacao);

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

    modifier contratoAtivo() {
        require(statusContrato == StatusContrato.Ativo, "Contrato deve estar ativo para registrar pontuacao.");
        require(block.timestamp < dataFim, "Contrato ja expirou.");
        _;
    }

    constructor(address _contratado, uint _dataInicio, uint _dataFim, uint _valorPorPF) payable {
        require(_dataFim > _dataInicio, "Data de fim deve ser posterior a data de inicio.");
        require(msg.value > 0, "O contratante deve enviar ETH suficiente para cobrir os pagamentos.");

        contratante = msg.sender; // Quem cria o contrato é o contratante
        contratado = _contratado;
        dataInicio = _dataInicio;
        dataFim = _dataFim;
        valorPorPF = _valorPorPF;
        statusContrato = StatusContrato.Pendente;

        emit ContratoCriado(contratante, contratado, dataInicio, dataFim, valorPorPF);
    }

    // Função para ativar o contrato quando ambas as partes tiverem assinado
    function ativarContrato() public apenasContratante {
        require(block.timestamp >= dataInicio, "Contrato nao pode ser ativado antes da data de inicio.");
        require(statusContrato == StatusContrato.Pendente, "Contrato ja esta ativo ou concluido.");

        statusContrato = StatusContrato.Ativo;
        emit ContratoAtivado(block.timestamp);
    }

    function registrarPontuacao(uint pontos) public apenasContratado contratoAtivo {
        uint valorPago = pontos * valorPorPF;
        require(address(this).balance >= valorPago, "Saldo insuficiente no contrato para realizar pagamento.");

        totalPontos += pontos;
        totalPago += valorPago;

        payable(contratado).transfer(valorPago);

        emit PagamentoRealizado(contratado, pontos, valorPago);
    }


    // Função para verificar se o contrato pode ser finalizado
    function finalizarContrato() public apenasContratante {
        require(block.timestamp >= dataFim, "Contrato ainda nao atingiu a data final.");
        require(statusContrato == StatusContrato.Ativo, "Contrato deve estar ativo para ser finalizado.");

        statusContrato = StatusContrato.Concluido;
        emit ContratoFinalizado(block.timestamp);
    }

    function saldoContrato() public view returns (uint) {
        return address(this).balance;
    }
}
