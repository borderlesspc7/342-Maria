import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import { paths } from "./paths";
import type { ReactNode } from "react";

interface ProtectedRoutesProps {
  children: ReactNode;
  /** Papéis permitidos para acessar a rota. Se não informado, qualquer usuário autenticado pode acessar. */
  allowedRoles?: Array<"admin" | "gestor" | "colaborador">;
}

export function ProtectedRoutes({ children, allowedRoles }: ProtectedRoutesProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return <Navigate to={paths.login} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!user.role || !allowedRoles.includes(user.role)) {
      return <Navigate to={paths.dashboard} replace />;
    }
  }

  return <>{children}</>;
}
