import { createContext, useContext, type ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNotifications } from "../hooks/useNotifications";
import type {
  Notificacao,
  NotificacaoStats,
} from "../types/notificacao";

interface NotificationContextType {
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

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  const {
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
  } = useNotifications(user?.uid, undefined, true);

  const value: NotificationContextType = {
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

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotificationContext deve ser usado dentro de um NotificationProvider"
    );
  }
  return context;
}

