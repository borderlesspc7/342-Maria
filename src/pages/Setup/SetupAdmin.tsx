import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAdminUser } from "../../utils/createAdminUser";
import "./SetupAdmin.css";

const SetupAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleCreateAdmin = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await createAdminUser();
      setMessage(
        "✅ Usuário admin criado com sucesso!\n" +
        "📧 Email: admin@gmail.com\n" +
        "🔑 Senha: 123456\n\n" +
        "Você pode fazer login agora!"
      );
    } catch (err: any) {
      setError(err.message || "Erro ao criar usuário admin");
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-container">
      <div className="setup-card">
        <h1>🔐 Setup - Criar Usuário Admin</h1>
        <p className="setup-description">
          Esta página cria o usuário administrador inicial no sistema.
          Execute apenas uma vez.
        </p>

        <div className="setup-info">
          <h3>Credenciais que serão criadas:</h3>
          <ul>
            <li><strong>Email:</strong> admin@gmail.com</li>
            <li><strong>Senha:</strong> 123456</li>
            <li><strong>Role:</strong> admin</li>
          </ul>
        </div>

        {message && (
          <div className="setup-message success">
            <pre>{message}</pre>
          </div>
        )}

        {error && (
          <div className="setup-message error">
            <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{error}</pre>
          </div>
        )}

        <div className="setup-actions">
          <button
            onClick={handleCreateAdmin}
            disabled={loading}
            className="setup-button"
          >
            {loading ? "Criando..." : "Criar Usuário Admin"}
          </button>

          <button
            onClick={() => navigate("/login")}
            className="setup-button secondary"
          >
            Ir para Login
          </button>
        </div>

        <div className="setup-warning">
          <p>⚠️ <strong>Atenção:</strong> Esta página deve ser removida em produção!</p>
        </div>
      </div>
    </div>
  );
};

export default SetupAdmin;
