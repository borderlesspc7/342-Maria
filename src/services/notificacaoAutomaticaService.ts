import { notificacaoService } from "./notificacaoService";
import { documentacoesService } from "./documentacoesService";
import { boletimMedicaoService } from "./boletimMedicaoService";
import { premioProdutividadeService } from "./premioProdutividadeService";
import type { Documento } from "../types/documentacoes";
import type { BoletimMedicao } from "../types/boletimMedicao";
import type { PremioProdutividade } from "../types/premioProdutividade";

/**
 * Serviço responsável por verificar automaticamente condições
 * que devem gerar notificações
 */
export const notificacaoAutomaticaService = {
  /**
   * Verifica documentos vencendo ou vencidos e cria notificações
   */
  async verificarDocumentos(userId: string): Promise<void> {
    try {
      const configuracoes = await notificacaoService.obterConfiguracoes(userId);
      const diasAntesVencimento = configuracoes.diasAntesVencimento || 7;
      
      // Buscar todos os documentos
      const documentos = await documentacoesService.listar();
      
      const agora = new Date();
      const dataLimiteVencendo = new Date();
      dataLimiteVencendo.setDate(dataLimiteVencendo.getDate() + diasAntesVencimento);
      
      for (const documento of documentos) {
        const dataValidade = new Date(documento.dataValidade);
        
        // Verificar se está vencido
        if (dataValidade < agora && documento.status === "Vencido") {
          // Verificar se já foi enviado alerta recentemente (últimas 24h)
          if (
            !documento.dataAlerta ||
            new Date().getTime() - new Date(documento.dataAlerta).getTime() > 24 * 60 * 60 * 1000
          ) {
            await notificacaoService.notificarDocumentoVencido(
              userId,
              documento.id,
              documento.colaboradorNome,
              documento.tipoDocumento,
              dataValidade
            );
            
            // Atualizar data do alerta no documento
            await documentacoesService.atualizar(documento.id, {
              ...documento,
              alertaEnviado: true,
              dataAlerta: new Date(),
            });
          }
        }
        
        // Verificar se está vencendo
        else if (
          dataValidade > agora &&
          dataValidade <= dataLimiteVencendo &&
          (documento.status === "Vencendo" || documento.status === "Válido")
        ) {
          // Verificar se já foi enviado alerta recentemente (últimas 24h)
          if (
            !documento.dataAlerta ||
            new Date().getTime() - new Date(documento.dataAlerta).getTime() > 24 * 60 * 60 * 1000
          ) {
            await notificacaoService.notificarDocumentoVencendo(
              userId,
              documento.id,
              documento.colaboradorNome,
              documento.tipoDocumento,
              dataValidade
            );
            
            // Atualizar data do alerta no documento
            await documentacoesService.atualizar(documento.id, {
              ...documento,
              alertaEnviado: true,
              dataAlerta: new Date(),
            });
          }
        }
      }
    } catch (error) {
      console.error("Erro ao verificar documentos:", error);
    }
  },

  /**
   * Verifica boletins pendentes ou vencendo e cria notificações
   */
  async verificarBoletins(userId: string): Promise<void> {
    try {
      // Buscar todos os boletins
      const boletins = await boletimMedicaoService.listar();
      
      const agora = new Date();
      const dataLimiteVencendo = new Date();
      dataLimiteVencendo.setDate(dataLimiteVencendo.getDate() + 7);
      
      for (const boletim of boletins) {
        // Verificar boletins pendentes
        if (boletim.status === "Pendente") {
          await notificacaoService.notificarBoletimPendente(
            userId,
            boletim.id,
            boletim.cliente,
            boletim.numero,
            boletim.valor
          );
        }
        
        // Verificar boletins vencendo
        if (boletim.dataVencimento) {
          const dataVencimento = new Date(boletim.dataVencimento);
          
          if (
            dataVencimento > agora &&
            dataVencimento <= dataLimiteVencendo &&
            boletim.status !== "Emitido"
          ) {
            await notificacaoService.notificarBoletimVencendo(
              userId,
              boletim.id,
              boletim.cliente,
              boletim.numero,
              dataVencimento
            );
          }
        }
      }
    } catch (error) {
      console.error("Erro ao verificar boletins:", error);
    }
  },

  /**
   * Verifica prêmios recém-lançados e cria notificações
   */
  async verificarPremios(userId: string): Promise<void> {
    try {
      // Buscar prêmios dos últimos 7 dias
      const premios = await premioProdutividadeService.listar();
      
      const seteDiasAtras = new Date();
      seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
      
      for (const premio of premios) {
        const dataCriacao = new Date(premio.criadoEm);
        
        // Se foi criado nos últimos 7 dias, notificar
        if (dataCriacao >= seteDiasAtras) {
          // Verificar se já existe notificação para este prêmio
          const notificacoesExistentes = await notificacaoService.listarPorUsuario(
            userId,
            { tipo: "premio_lancado" }
          );
          
          const jaNotificado = notificacoesExistentes.some(
            (n) => n.metadata?.premioId === premio.id
          );
          
          if (!jaNotificado) {
            await notificacaoService.notificarPremioLancado(
              userId,
              premio.id,
              premio.colaboradorNome,
              premio.valor,
              premio.motivo
            );
          }
        }
      }
    } catch (error) {
      console.error("Erro ao verificar prêmios:", error);
    }
  },

  /**
   * Executa todas as verificações automáticas
   */
  async executarVerificacaoCompleta(userId: string): Promise<void> {
    console.log("Iniciando verificação automática de notificações...");
    
    try {
      await Promise.all([
        this.verificarDocumentos(userId),
        this.verificarBoletins(userId),
        this.verificarPremios(userId),
      ]);
      
      console.log("Verificação automática concluída com sucesso");
    } catch (error) {
      console.error("Erro na verificação automática:", error);
    }
  },

  /**
   * Inicia um intervalo de verificação periódica
   * @param userId ID do usuário
   * @param intervalMinutos Intervalo em minutos (padrão: 60)
   * @returns Função para cancelar o intervalo
   */
  iniciarVerificacaoPeriodica(
    userId: string,
    intervalMinutos: number = 60
  ): () => void {
    console.log(`Iniciando verificação periódica a cada ${intervalMinutos} minutos`);
    
    // Executar imediatamente
    this.executarVerificacaoCompleta(userId);
    
    // Configurar intervalo
    const intervalId = setInterval(() => {
      this.executarVerificacaoCompleta(userId);
    }, intervalMinutos * 60 * 1000);
    
    // Retornar função para cancelar
    return () => {
      console.log("Cancelando verificação periódica");
      clearInterval(intervalId);
    };
  },

  /**
   * Verifica documentos de um colaborador específico
   */
  async verificarDocumentosColaborador(
    userId: string,
    colaboradorId: string
  ): Promise<void> {
    try {
      const configuracoes = await notificacaoService.obterConfiguracoes(userId);
      const diasAntesVencimento = configuracoes.diasAntesVencimento || 7;
      
      const documentos = await documentacoesService.listar({
        colaboradorNome: undefined, // Buscar todos e filtrar
      });
      
      const documentosColaborador = documentos.filter(
        (d) => d.colaboradorId === colaboradorId
      );
      
      const agora = new Date();
      const dataLimiteVencendo = new Date();
      dataLimiteVencendo.setDate(dataLimiteVencendo.getDate() + diasAntesVencimento);
      
      for (const documento of documentosColaborador) {
        const dataValidade = new Date(documento.dataValidade);
        
        if (dataValidade < agora && documento.status === "Vencido") {
          await notificacaoService.notificarDocumentoVencido(
            userId,
            documento.id,
            documento.colaboradorNome,
            documento.tipoDocumento,
            dataValidade
          );
        } else if (
          dataValidade > agora &&
          dataValidade <= dataLimiteVencendo
        ) {
          await notificacaoService.notificarDocumentoVencendo(
            userId,
            documento.id,
            documento.colaboradorNome,
            documento.tipoDocumento,
            dataValidade
          );
        }
      }
    } catch (error) {
      console.error("Erro ao verificar documentos do colaborador:", error);
    }
  },

  /**
   * Limpa notificações antigas (mais de 30 dias)
   */
  async limparNotificacoesAntigas(userId: string): Promise<void> {
    try {
      const notificacoes = await notificacaoService.listarPorUsuario(userId);
      
      const trintaDiasAtras = new Date();
      trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
      
      const notificacoesAntigas = notificacoes.filter(
        (n) => n.lida && new Date(n.criadoEm) < trintaDiasAtras
      );
      
      for (const notificacao of notificacoesAntigas) {
        await notificacaoService.deletar(notificacao.id);
      }
      
      console.log(`${notificacoesAntigas.length} notificações antigas foram removidas`);
    } catch (error) {
      console.error("Erro ao limpar notificações antigas:", error);
    }
  },

  /**
   * Gera relatório de notificações
   */
  async gerarRelatorio(userId: string): Promise<{
    totalNotificacoes: number;
    naoLidas: number;
    porTipo: Record<string, number>;
    porPrioridade: Record<string, number>;
    ultimasNotificacoes: any[];
  }> {
    try {
      const stats = await notificacaoService.obterEstatisticas(userId);
      const notificacoes = await notificacaoService.listarPorUsuario(userId, undefined, 10);
      
      return {
        totalNotificacoes: stats.total,
        naoLidas: stats.naoLidas,
        porTipo: stats.porTipo,
        porPrioridade: stats.porPrioridade,
        ultimasNotificacoes: notificacoes,
      };
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      throw error;
    }
  },
};

