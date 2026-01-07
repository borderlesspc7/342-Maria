/**
 * EXEMPLO DE INTEGRAÇÃO DO SISTEMA DE NOTIFICAÇÕES
 * 
 * Este arquivo mostra como integrar notificações nos serviços existentes
 * Copie e adapte estes exemplos para seus serviços
 */

import { notificacaoService } from './notificacaoService';
import { notificacaoAutomaticaService } from './notificacaoAutomaticaService';

// ============================================
// EXEMPLO 1: Criar notificação ao adicionar documento
// ============================================

async function exemploAdicionarDocumento(userId: string, documentoData: any) {
  try {
    // Adicionar documento normalmente
    const documento = await documentacoesService.criar(documentoData);
    
    // Verificar se o documento está vencendo
    const dataValidade = new Date(documento.dataValidade);
    const agora = new Date();
    const diasParaVencer = Math.ceil((dataValidade.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24));
    
    // Se está vencendo em menos de 7 dias, criar notificação imediatamente
    if (diasParaVencer <= 7 && diasParaVencer > 0) {
      await notificacaoService.notificarDocumentoVencendo(
        userId,
        documento.id,
        documento.colaboradorNome,
        documento.tipoDocumento,
        dataValidade
      );
    }
    
    return documento;
  } catch (error) {
    console.error('Erro ao adicionar documento:', error);
    throw error;
  }
}

// ============================================
// EXEMPLO 2: Criar notificação ao lançar prêmio
// ============================================

async function exemploLancarPremio(userId: string, premioData: any) {
  try {
    // Criar prêmio normalmente
    const premio = await premioProdutividadeService.criar(premioData);
    
    // Criar notificação automática
    await notificacaoService.notificarPremioLancado(
      userId,
      premio.id,
      premio.colaboradorNome,
      premio.valor,
      premio.motivo
    );
    
    return premio;
  } catch (error) {
    console.error('Erro ao lançar prêmio:', error);
    throw error;
  }
}

// ============================================
// EXEMPLO 3: Criar notificação ao adicionar boletim pendente
// ============================================

async function exemploAdicionarBoletim(userId: string, boletimData: any) {
  try {
    // Criar boletim normalmente
    const boletim = await boletimMedicaoService.criar(boletimData);
    
    // Se o boletim está pendente, criar notificação
    if (boletim.status === 'Pendente') {
      await notificacaoService.notificarBoletimPendente(
        userId,
        boletim.id,
        boletim.cliente,
        boletim.numero,
        boletim.valor
      );
    }
    
    return boletim;
  } catch (error) {
    console.error('Erro ao adicionar boletim:', error);
    throw error;
  }
}

// ============================================
// EXEMPLO 4: Executar verificação após atualização em lote
// ============================================

async function exemploAtualizacaoEmLote(userId: string) {
  try {
    // Realizar atualizações em lote
    // ... código de atualização ...
    
    // Executar verificação completa após atualização
    await notificacaoAutomaticaService.executarVerificacaoCompleta(userId);
    
    console.log('Verificação de notificações concluída');
  } catch (error) {
    console.error('Erro na atualização:', error);
    throw error;
  }
}

// ============================================
// EXEMPLO 5: Criar notificação personalizada
// ============================================

async function exemploCriarNotificacaoPersonalizada(userId: string) {
  try {
    await notificacaoService.criar({
      userId,
      tipo: 'sistema',
      prioridade: 'media',
      titulo: 'Atualização do Sistema',
      mensagem: 'Uma nova funcionalidade foi adicionada ao sistema',
      link: '/novidades',
      metadata: {
        versao: '2.0.0',
        dataLancamento: new Date(),
      }
    });
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    throw error;
  }
}

// ============================================
// EXEMPLO 6: Verificar documentos de um colaborador específico
// ============================================

async function exemploVerificarDocumentosColaborador(userId: string, colaboradorId: string) {
  try {
    // Verificar documentos de um colaborador específico
    await notificacaoAutomaticaService.verificarDocumentosColaborador(
      userId,
      colaboradorId
    );
    
    console.log('Documentos do colaborador verificados');
  } catch (error) {
    console.error('Erro na verificação:', error);
    throw error;
  }
}

// ============================================
// EXEMPLO 7: Criar notificação em lote
// ============================================

async function exemploCriarNotificacoesEmLote(userIds: string[]) {
  try {
    const notificacoes = userIds.map(userId => ({
      userId,
      tipo: 'sistema' as const,
      prioridade: 'baixa' as const,
      titulo: 'Manutenção Programada',
      mensagem: 'O sistema ficará offline para manutenção no domingo às 2h',
    }));
    
    await notificacaoService.criarEmLote(notificacoes);
    
    console.log(`${notificacoes.length} notificações criadas`);
  } catch (error) {
    console.error('Erro ao criar notificações em lote:', error);
    throw error;
  }
}

// ============================================
// EXEMPLO 8: Usar em um componente React
// ============================================

import { useNotificationContext } from '../contexts/NotificationContext';

function ExemploComponente() {
  const { notificacoes, naoLidas, marcarComoLida } = useNotificationContext();
  
  const handleNotificationClick = async (id: string, link?: string) => {
    await marcarComoLida(id);
    if (link) {
      // Navegar para o link
      window.location.href = link;
    }
  };
  
  return (
    <div>
      <h2>Você tem {naoLidas} notificações não lidas</h2>
      {notificacoes.slice(0, 5).map(notif => (
        <div key={notif.id} onClick={() => handleNotificationClick(notif.id, notif.link)}>
          <h3>{notif.titulo}</h3>
          <p>{notif.mensagem}</p>
        </div>
      ))}
    </div>
  );
}

// ============================================
// EXEMPLO 9: Monitorar notificações em tempo real
// ============================================

import { useEffect } from 'react';

function ExemploMonitoramento(userId: string) {
  useEffect(() => {
    // Iniciar observador de notificações não lidas
    const unsubscribe = notificacaoService.observarNotificacoesNaoLidas(
      userId,
      (count) => {
        console.log(`Notificações não lidas: ${count}`);
        // Atualizar UI, tocar som, etc.
        if (count > 0) {
          // playNotificationSound();
        }
      }
    );
    
    // Cleanup ao desmontar
    return () => unsubscribe();
  }, [userId]);
}

// ============================================
// EXEMPLO 10: Gerar relatório de notificações
// ============================================

async function exemploGerarRelatorio(userId: string) {
  try {
    const relatorio = await notificacaoAutomaticaService.gerarRelatorio(userId);
    
    console.log('Relatório de Notificações:', {
      'Total de Notificações': relatorio.totalNotificacoes,
      'Não Lidas': relatorio.naoLidas,
      'Por Tipo': relatorio.porTipo,
      'Por Prioridade': relatorio.porPrioridade,
    });
    
    return relatorio;
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    throw error;
  }
}

/**
 * DICAS IMPORTANTES:
 * 
 * 1. Sempre usar try-catch ao criar notificações para não quebrar o fluxo principal
 * 2. Considerar criar notificações de forma assíncrona/background
 * 3. Evitar criar notificações duplicadas (verificar antes)
 * 4. Usar metadata para armazenar informações contextuais
 * 5. Definir prioridade adequada (urgente, alta, media, baixa)
 * 6. Sempre incluir link quando possível para melhor UX
 * 7. Usar títulos curtos e mensagens descritivas
 * 8. Testar notificações em diferentes cenários
 */

export {
  exemploAdicionarDocumento,
  exemploLancarPremio,
  exemploAdicionarBoletim,
  exemploAtualizacaoEmLote,
  exemploCriarNotificacaoPersonalizada,
  exemploVerificarDocumentosColaborador,
  exemploCriarNotificacoesEmLote,
  exemploGerarRelatorio,
};

