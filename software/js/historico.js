// Chave usada no LocalStorage
const CHAVE_HISTORICO = 'stopLeak_historico_eventos';

// Função para buscar o histórico salvo (ou carregar o padrão)
function obterHistorico() {
  const dados = localStorage.getItem(CHAVE_HISTORICO);
  if (dados) {
    return JSON.parse(dados);
  }
  
  // Registros padrão caso ainda não exista histórico salvo
  return [
    {
      data: '08/09/2026',
      hora: '07:14:05',
      status: 'Alerta de vazamento',
      tipo: 'vazamento',
      vazao: '9,4 L/min',
      acao: 'Válvula fechada automaticamente',
      descricao: 'Vazão anormal detectada pelo sensor YF-S201. Sistema ativou o corte emergencial.'
    },
    {
      data: '08/09/2026',
      hora: '06:45:12',
      status: 'Bomba DESLIGADA',
      tipo: 'bomba',
      vazao: '0,0 L/min',
      acao: 'Reservatório cheio (Desativação automática)',
      descricao: 'O nível máximo do reservatório foi atingido. O microcontrolador ESP32 enviou o sinal de desligamento.'
    }
  ];
}

// Função GLOBAL para REGISTRAR nova ação (Chame isso ao clicar nos botões)
function registrarNovoEvento(statusTexto, tipoStatus, vazaoTexto, acaoTexto, descricaoTexto) {
  const historicoAtual = obterHistorico();
  const agora = new Date();
  
  const novoEvento = {
    data: agora.toLocaleDateString('pt-BR'),
    hora: agora.toLocaleTimeString('pt-BR'),
    status: statusTexto,
    tipo: tipoStatus,
    vazao: vazaoTexto,
    acao: acaoTexto,
    descricao: descricaoTexto
  };

  // Adiciona o novo evento no INÍCIO da lista
  historicoAtual.unshift(novoEvento);

  // Salva no LocalStorage
  localStorage.setItem(CHAVE_HISTORICO, JSON.stringify(historicoAtual));
}