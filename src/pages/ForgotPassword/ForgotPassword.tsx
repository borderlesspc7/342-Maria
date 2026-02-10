import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiMail, HiArrowLeft, HiCheckCircle } from "react-icons/hi";
import { authService } from "../../services/authService";
import "./ForgotPassword.css";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) {
      setError("");
    }
  };

  const validateEmail = () => {
    if (!email) {
      setError("Email é obrigatório");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("E-mail inválido");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (typeof authService.resetPassword === "function") {
        await authService.resetPassword(email);
        setEmailSent(true);
      } else {
        setError("Recuperação de senha não está disponível nesta configuração.");
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Erro ao enviar e-mail de recuperação"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-background">
        <div className="shape-1"></div>
        <div className="shape-2"></div>
      </div>
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <div className="logo-container">
            <div className="logo-icon">
              <HiMail size={48} />
            </div>
          </div>
          {!emailSent ? (
            <>
              <h1>Recuperar Senha</h1>
              <p>Digite seu e-mail para receber o link de recuperação</p>
            </>
          ) : (
            <>
              <div className="success-icon">
                <HiCheckCircle />
              </div>
              <h1>E-mail Enviado!</h1>
              <p>Verifique sua caixa de entrada para continuar</p>
            </>
          )}
        </div>

        {!emailSent ? (
          <form className="forgot-password-form" onSubmit={handleSubmit}>
            <div className="forgot-password-form-group">
              <label htmlFor="email">E-mail</label>
              <div className="forgot-password-input-wrapper">
                <HiMail className="forgot-password-input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  required
                  placeholder="seu.email@empresa.com"
                  onChange={handleChange}
                  className={error ? "error" : ""}
                />
              </div>
              {error && (
                <span className="forgot-password-error-message">{error}</span>
              )}
            </div>

            <button
              type="submit"
              className="forgot-password-btn-primary"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar Link de Recuperação"}
            </button>

            <div className="forgot-password-divider"></div>

            <button
              type="button"
              className="forgot-password-btn-secondary"
              onClick={() => navigate("/login")}
              disabled={loading}
            >
              {" "}
              <HiArrowLeft /> Voltar para Login
            </button>
          </form>
        ) : (
          <div className="forgot-password-success">
            <div className="success-message">
              <p>
                Enviamos um e-mail para <strong>{email}</strong> com instruções
                para redefinir sua senha.
              </p>
              <p className="success-hint">
                Se você não receber o e-mail, verifique sua caixa de spam ou
                tente novamente.
              </p>
            </div>

            <div className="forgot-password-success-actions">
              <button
                className="forgot-password-btn-secondary"
                onClick={() => {
                  setEmailSent(false);
                  setEmail("");
                  setError("");
                }}
              >
                {" "}
                <HiArrowLeft /> Enviar novamente
              </button>
              <button
                className="forgot-password-btn-primary"
                onClick={() => navigate("/login")}
              >
                {" "}
                <HiArrowLeft /> Voltar para Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
