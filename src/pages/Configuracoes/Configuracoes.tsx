import "./Configuracoes.css";
import { useAuth } from "../../hooks/useAuth";
import Layout from "../../components/Layout/Layout";
import { HiUser, HiMail, HiLogout, HiLockClosed } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ChangePasswordModal } from "../../components/ChangePasswordModal";

export default function Configuracoes() {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logOut } = useAuth();

  function handleLogout() {
    logOut();
    navigate("/login");
  }

  return (
    <Layout>
      <div className="settings-container">
        <h2 className="settings-title">Configurações</h2>

        {/* Conta */}
        <div className="settings-card">
          <h3 className="settings-section-title">
            <HiUser /> Conta
          </h3>

          <div className="perfil-info">
            <div className="perfil-item">
              <span className="label">
                <HiUser /> Nome
              </span>
              <span className="value">{user?.name}</span>
            </div>

            <div className="perfil-item">
              <span className="label">
                <HiMail /> Email
              </span>
              <span className="value">{user?.email}</span>
            </div>

            <div className="perfil-item">
              <span className="label">Perfil</span>
              <span className="value">
                {user?.role === "admin" ? "Administrador" : "Colaborador"}
              </span>
            </div>
          </div>
        </div>

        {/* Segurança */}
        <div className="settings-card">
          <h3 className="settings-section-title">
            <HiLockClosed /> Segurança
          </h3>

          <div className="settings-item action">
            <span className="label">Alterar senha</span>
            <button
              className="settings-button secondary"
              onClick={() => setIsChangePasswordOpen(true)}
            >
              Alterar
            </button>
          </div>

          <div className="settings-item action">
            <span className="label">Encerrar sessão</span>
            <button
              className="settings-button danger"
              onClick={handleLogout}
            >
              <HiLogout /> Sair
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Alterar Senha */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </Layout>
  );
}
