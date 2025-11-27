import { BrowserRouter, Routes, Route } from "react-router-dom";
import { paths } from "./paths";
import { ProtectedRoutes } from "./ProtectedRoutes";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Dashboard from "../pages/Dashboard/Dashboard";
import PremiosProdutividade from "../pages/PremiosProdutividade/PremiosProdutividade";
import BoletinsMedicao from "../pages/BoletinsMedicao/BoletinsMedicao";
import Documentacoes from "../pages/Documentacoes/Documentacoes";
import CadernoVirtual from "../pages/CadernoVirtual/CadernoVirtual";
import LancamentosDiarios from "../pages/LancamentosDiarios/LancamentosDiarios";
import Relatorios from "../pages/Relatorios/Relatorios";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={paths.home} element={<Dashboard />} />
        <Route path={paths.login} element={<Login />} />
        <Route path={paths.register} element={<Register />} />
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
          path={paths.lancamentosDiarios}
          element={
            <ProtectedRoutes>
              <LancamentosDiarios />
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
      </Routes>
    </BrowserRouter>
  );
}
