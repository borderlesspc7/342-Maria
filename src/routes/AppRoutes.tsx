import { BrowserRouter, Routes, Route } from "react-router-dom";
import { paths } from "./paths";
import { ProtectedRoutes } from "./ProtectedRoutes";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import Dashboard from "../pages/Dashboard/Dashboard";
import Colaboradores from "../pages/Colaboradores/Colaboradores";
import PremiosProdutividade from "../pages/PremiosProdutividade/PremiosProdutividade";
import BoletinsMedicao from "../pages/BoletinsMedicao/BoletinsMedicao";
import Documentacoes from "../pages/Documentacoes/Documentacoes";
import CadernoVirtual from "../pages/CadernoVirtual/CadernoVirtual";
import Relatorios from "../pages/Relatorios/Relatorios";
import Financeiro from "../pages/Financeiro/Financeiro";
import Notificacoes from "../pages/Notificacoes/Notificacoes";
import DocumentosFinanceiros from "../pages/DocumentosFinanceiros/DocumentosFinanceiros";
import Perfil from "../pages/Perfil/Perfil";
import Configuracoes from "../pages/Configuracoes/Configuracoes";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={paths.login} element={<Login />} />
        <Route path={paths.register} element={<Register />} />
        <Route path={paths.forgotPassword} element={<ForgotPassword />} />
        <Route
          path={paths.home}
          element={
            <ProtectedRoutes>
              <Dashboard />
            </ProtectedRoutes>
          }
        />
        <Route
          path={paths.dashboard}
          element={
            <ProtectedRoutes>
              <Dashboard />
            </ProtectedRoutes>
          }
        />
        <Route
          path={paths.colaboradores}
          element={
            <ProtectedRoutes>
              <Colaboradores />
            </ProtectedRoutes>
          }
        />
        <Route
          path={paths.premiosProdutividade}
          element={
            <ProtectedRoutes>
              <PremiosProdutividade />
            </ProtectedRoutes>
          }
        />
        <Route
          path={paths.boletinsMedicao}
          element={
            <ProtectedRoutes>
              <BoletinsMedicao />
            </ProtectedRoutes>
          }
        />
        <Route
          path={paths.documentacoes}
          element={
            <ProtectedRoutes>
              <Documentacoes />
            </ProtectedRoutes>
          }
        />
        <Route
          path={paths.cadernoVirtual}
          element={
            <ProtectedRoutes>
              <CadernoVirtual />
            </ProtectedRoutes>
          }
        />
        <Route
          path={paths.relatorios}
          element={
            <ProtectedRoutes>
              <Relatorios />
            </ProtectedRoutes>
          }
        />
        <Route
          path={paths.financeiro}
          element={
            <ProtectedRoutes>
              <Financeiro />
            </ProtectedRoutes>
          }
        />
        <Route
          path={paths.notificacoes}
          element={
            <ProtectedRoutes>
              <Notificacoes />
            </ProtectedRoutes>
          }
        />
        <Route
          path={paths.perfil}
          element={
            <ProtectedRoutes>
              <Perfil />
            </ProtectedRoutes>
          }
        />
        <Route
          path={paths.configuracoes}
          element={
            <ProtectedRoutes>
              <Configuracoes />
            </ProtectedRoutes>
          }
        />
        <Route
          path={paths.documentosFinanceiros}
          element={
            <ProtectedRoutes>
              <DocumentosFinanceiros />
            </ProtectedRoutes>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
