import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiMail, HiLockClosed, HiUser } from "react-icons/hi";
import { useAuth } from "../../hooks/useAuth";
import "./Login.css";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const { login, loading } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!formData.email) {
      newErrors.email = "E-mail é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "E-mail inválido";
    }

    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
    } else if (formData.password.length < 6) {
      newErrors.password = "Senha deve ter no mínimo 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearInput = () => {
    setFormData({ email: "", password: "" });
    setRememberMe(false);
    setErrors({ email: undefined, password: undefined });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });
      navigate("/dashboard");
      clearInput();
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      setErrors({
        email: "Erro ao fazer login",
        password: "Erro ao fazer login",
      });
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="shape-1"></div>
        <div className="shape-2"></div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="logo-container">
            <div className="logo-icon">
              <HiUser />
            </div>
          </div>
          <h1>Bem-vindo de volta!</h1>
          <p>Acesse sua conta para continuar</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <div className="input-wrapper">
              <HiMail className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="seu.email@empresa.com"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "error" : ""}
              />
            </div>
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <div className="input-wrapper">
              <HiLockClosed className="input-icon" />
              <input
                type="password"
                id="password"
                name="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "error" : ""}
              />
            </div>
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <div className="form-options">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="checkmark"></span>
              Lembrar-me
            </label>
            <a href="#" className="forgot-password">
              Esqueceu a senha?
            </a>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <div className="divider"></div>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/register")}
          >
            Criar nova conta
          </button>

          <div className="login-footer">
            <p>© 2025 Sistema de Gestão RH. Todos os direitos reservados.</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
