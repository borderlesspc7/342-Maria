import { BrowserRouter, Routes, Route } from "react-router-dom";
import { paths } from "./paths";
import { ProtectedRoutes } from "./ProtectedRoutes";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import Dashboard from "../pages/Dashboard/Dashboard";
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
        <Route path={paths.home} element={<Dashboard />} />
        <Route path={paths.login} element={<Login />} />
        <Route path={paths.register} element={<Register />} />
        <Route path={paths.forgotPassword} element={<ForgotPassword />} />
        <Route
          path={paths.dashboard}
          element={
            <ProtectedRoutes>
              <Dashboard />
            </ProtectedRoutes>
          }
        />
        <Route
          path={paths.premiosProdutividade}
          element={<PremiosProdutividade />}
        />
        <Route path={paths.boletinsMedicao} element={<BoletinsMedicao />} />
        <Route path={paths.documentacoes} element={<Documentacoes />} />
        <Route path={paths.cadernoVirtual} element={<CadernoVirtual />} />
        <Route path={paths.relatorios} element={<Relatorios />} />
        <Route path={paths.financeiro} element={<Financeiro />} />
        <Route path={paths.notificacoes} element={<Notificacoes />} />
        <Route path={paths.perfil} element={<Perfil />} />
        <Route path={paths.configuracoes} element={<Configuracoes />} />
        <Route path={paths.documentosFinanceiros} element={<DocumentosFinanceiros />} />
      </Routes>
    </BrowserRouter>
  );
}
