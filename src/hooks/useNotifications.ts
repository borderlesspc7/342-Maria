import { useState, useEffect } from "react";
import { notificacaoService } from "../services/notificacaoService";
import type {
  Notificacao,
  NotificacaoFilters,
  NotificacaoStats,
} from "../types/notificacao";

interface UseNotificationsReturn {
  notificacoes: Notificacao[];
  naoLidas: number;
  stats: NotificacaoStats | null;
  loading: boolean;
  error: string | null;
  marcarComoLida: (id: string) => Promise<void>;
  marcarTodasComoLidas: () => Promise<void>;
  deletar: (id: string) => Promise<void>;
  deletarTodasLidas: () => Promise<void>;
  recarregar: () => Promise<void>;
}

export function useNotifications(
  userId: string | undefined,
  filters?: NotificacaoFilters,
  enableRealtime: boolean = true
): UseNotificationsReturn {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [naoLidas, setNaoLidas] = useState<number>(0);
  const [stats, setStats] = useState<NotificacaoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregar = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [notifs, estatisticas] = await Promise.all([
        notificacaoService.listarPorUsuario(userId, filters),
        notificacaoService.obterEstatisticas(userId),
      ]);

      setNotificacoes(notifs);
      setStats(estatisticas);
      setNaoLidas(estatisticas.naoLidas);
    } catch (err) {
      console.error("Erro ao carregar notificações:", err);
      setError("Erro ao carregar notificações");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    if (enableRealtime) {
      // Observador em tempo real
      const unsubscribeNotifs = notificacaoService.observarNotificacoes(
        userId,
        (notifs) => {
          setNotificacoes(notifs);
          // Atualizar estatísticas também
          notificacaoService.obterEstatisticas(userId).then(setStats);
        }
      );

      const unsubscribeNaoLidas = notificacaoService.observarNotificacoesNaoLidas(
        userId,
        setNaoLidas
      );

      setLoading(false);

      return () => {
        unsubscribeNotifs();
        unsubscribeNaoLidas();
      };
    } else {
      // Carregar uma vez
      carregar();
    }
  }, [userId, enableRealtime, JSON.stringify(filters)]);

  const marcarComoLida = async (id: string) => {
    try {
      setError(null);
      await notificacaoService.marcarComoLida(id);
      
      // Atualizar localmente
      setNotificacoes((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, lida: true, lidoEm: new Date() } : n
        )
      );
      setNaoLidas((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Erro ao marcar como lida:", err);
      setError("Erro ao marcar como lida");
      throw err;
    }
  };

  const marcarTodasComoLidas = async () => {
    if (!userId) return;

    try {
      setError(null);
      await notificacaoService.marcarTodasComoLidas(userId);
      
      // Atualizar localmente
      setNotificacoes((prev) =>
        prev.map((n) => ({ ...n, lida: true, lidoEm: new Date() }))
      );
      setNaoLidas(0);
    } catch (err) {
      console.error("Erro ao marcar todas como lidas:", err);
      setError("Erro ao marcar todas como lidas");
      throw err;
    }
  };

  const deletar = async (id: string) => {
    try {
      setError(null);
      await notificacaoService.deletar(id);
      
      // Atualizar localmente
      const notificacao = notificacoes.find((n) => n.id === id);
      setNotificacoes((prev) => prev.filter((n) => n.id !== id));
      
      if (notificacao && !notificacao.lida) {
        setNaoLidas((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Erro ao deletar notificação:", err);
      setError("Erro ao deletar notificação");
      throw err;
    }
  };

  const deletarTodasLidas = async () => {
    if (!userId) return;

    try {
      setError(null);
      await notificacaoService.deletarTodasLidas(userId);
      
      // Atualizar localmente
      setNotificacoes((prev) => prev.filter((n) => !n.lida));
    } catch (err) {
      console.error("Erro ao deletar notificações lidas:", err);
      setError("Erro ao deletar notificações lidas");
      throw err;
    }
  };

  const recarregar = async () => {
    await carregar();
  };

  return {
    notificacoes,
    naoLidas,
    stats,
    loading,
    error,
    marcarComoLida,
    marcarTodasComoLidas,
    deletar,
    deletarTodasLidas,
    recarregar,
  };
}

