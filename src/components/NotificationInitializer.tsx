import { useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { notificacaoAutomaticaService } from '../services/notificacaoAutomaticaService';

/**
 * Componente que inicializa o sistema de verificação automática de notificações
 * Deve ser incluído no App ou Layout principal
 */
export function NotificationInitializer() {
  const { user } = useAuth();
  const cancelarVerificacaoRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      // Se não há usuário, cancelar verificação se existir
      if (cancelarVerificacaoRef.current) {
        cancelarVerificacaoRef.current();
        cancelarVerificacaoRef.current = null;
      }
      return;
    }

    // Iniciar verificação periódica (a cada 60 minutos)
    cancelarVerificacaoRef.current = notificacaoAutomaticaService.iniciarVerificacaoPeriodica(
      user.uid,
      60
    );

    // Limpar notificações antigas semanalmente
    const limparAntigasInterval = setInterval(() => {
      notificacaoAutomaticaService.limparNotificacoesAntigas(user.uid);
    }, 7 * 24 * 60 * 60 * 1000); // 7 dias em milissegundos

    // Cleanup
    return () => {
      if (cancelarVerificacaoRef.current) {
        cancelarVerificacaoRef.current();
        cancelarVerificacaoRef.current = null;
      }
      clearInterval(limparAntigasInterval);
    };
  }, [user?.uid]);

  // Este componente não renderiza nada
  return null;
}

