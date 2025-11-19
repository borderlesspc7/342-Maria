import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import { paths } from "./paths";
import type { ReactNode } from "react";

interface ProtectedRoutesProps {
  children: ReactNode;
}

export function ProtectedRoutes({ children }: ProtectedRoutesProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return <Navigate to={paths.login} replace />;
  }

  return <>{children}</>;
}
