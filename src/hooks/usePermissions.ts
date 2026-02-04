import { useAuth } from "./useAuth";

/**
 * Hook para verificar permissões do usuário atual
 */
export function usePermissions() {
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";
  const isGestor = user?.role === "gestor";
  const isColaborador = user?.role === "colaborador";

  /**
   * Verifica se o usuário pode editar dados
   * Admin e Gestor podem editar, Colaborador apenas visualiza
   */
  const canEdit = isAdmin || isGestor;

  /**
   * Verifica se o usuário tem acesso à área de administração
   * Apenas Admin tem acesso
   */
  const canAccessAdmin = isAdmin;

  return {
    isAdmin,
    isGestor,
    isColaborador,
    canEdit,
    canAccessAdmin,
    userRole: user?.role,
  };
}
