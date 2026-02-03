import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";
import {
  HiUsers,
  HiDocumentText,
  HiClipboardList,
  HiExclamationCircle,
  HiCheckCircle,
  HiClock,
  HiTrendingUp,
  HiFolder,
  HiLink,
  HiX,
  HiArrowRight,
} from "react-icons/hi";
import { paths } from "../../routes/paths";
import { colaboradorService } from "../../services/colaboradorService";
import { documentacoesService } from "../../services/documentacoesService";
import { boletimMedicaoService } from "../../services/boletimMedicaoService";
import { premioProdutividadeService } from "../../services/premioProdutividadeService";
import "./Dashboard.css";

const MESES_PT: string[] = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

interface Notification {
  id: string;
  type: "alert" | "info" | "success" | "warning";
  title: string;
  message: string;
  time: string;
  category: "integracao" | "premio" | "boletim" | "documentacao" | "geral";
  read: boolean;
}

interface DashboardStats {
  colaboradores: number;
  documentosPendentes: number;
  boletinsMes: number;
  premiosAtivos: number;
  integracoesAtivas: number;
  integracoesComErro: number;
}

const initialStats: DashboardStats = {
  colaboradores: 0,
  documentosPendentes: 0,
  boletinsMes: 0,
  premiosAtivos: 0,
  integracoesAtivas: 0,
  integracoesComErro: 0,
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [statsLoading, setStatsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "alert",
      title: "Integração com sistema externo falhou",
      message: "A sincronização com o sistema de folha de pagamento não foi concluída hoje às 08:30",
      time: "Há 2 horas",
      category: "integracao",
      read: false,
    },
    {
      id: "2",
      type: "warning",
      title: "Documentos próximos do vencimento",
      message: "5 documentos vencem nos próximos 7 dias. Ação necessária.",
      time: "Há 3 horas",
      category: "documentacao",
      read: false,
    },
    {
      id: "3",
      type: "success",
      title: "Novo prêmio de produtividade disponível",
      message: "Prêmio do mês de outubro foi calculado e está disponível para visualização",
      time: "Há 5 horas",
      category: "premio",
      read: false,
    },
    {
      id: "4",
      type: "info",
      title: "Boletim de medição adicionado",
      message: "Boletim de medição de outubro/2024 foi adicionado ao sistema",
      time: "Hoje às 09:15",
      category: "boletim",
      read: false,
    },
    {
      id: "5",
      type: "alert",
      title: "Falha na integração de dados",
      message: "Erro ao sincronizar dados de colaboradores. Tentar novamente?",
      time: "Ontem às 16:45",
      category: "integracao",
      read: true,
    },
    {
      id: "6",
      type: "success",
      title: "Todos os documentos em dia",
      message: "Nenhum documento com pendência no momento",
      time: "Hoje às 08:00",
      category: "documentacao",
      read: true,
    },
  ]);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const now = new Date();
      const mesAtual = MESES_PT[now.getMonth()];
      const anoAtual = now.getFullYear();

      const [colaboradores, documentos, boletins, premios] = await Promise.all([
        colaboradorService.list(),
        documentacoesService.list(),
        boletimMedicaoService.getAll({ mes: mesAtual, ano: anoAtual }),
        premioProdutividadeService.list(),
      ]);

      const documentosPendentes = documentos.filter(
        (d) => d.status === "Pendente" || d.status === "Vencido" || d.status === "Vencendo"
      ).length;

      setStats({
        colaboradores: colaboradores.length,
        documentosPendentes,
        boletinsMes: boletins.length,
        premiosAtivos: premios.length,
        integracoesAtivas: 0,
        integracoesComErro: 0,
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas do dashboard:", error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "alert":
        return <HiExclamationCircle className="icon-alert" />;
      case "warning":
        return <HiExclamationCircle className="icon-warning" />;
      case "success":
        return <HiCheckCircle className="icon-success" />;
      case "info":
        return <HiClock className="icon-info" />;
      default:
        return <HiClock className="icon-info" />;
    }
  };

  const getCategoryLabel = (category: Notification["category"]) => {
    switch (category) {
      case "integracao":
        return "Integração";
      case "premio":
        return "Prêmio";
      case "boletim":
        return "Boletim";
      case "documentacao":
        return "Documentação";
      default:
        return "Geral";
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const todayNotifications = notifications.filter((n) =>
    n.time.includes("Hoje")
  );

  return (
    <Layout>
      <div className="dashboard">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-subtitle">
              Resumo diário do sistema de gestão RH
            </p>
          </div>
          <div className="dashboard-date">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        <div className="stats-grid">
          <div
            className="stat-card stat-card-clickable"
            onClick={() => navigate(paths.colaboradores)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && navigate(paths.colaboradores)}
            aria-label="Ver colaboradores"
          >
            <div className="stat-icon stat-icon-blue">
              <HiUsers />
            </div>
            <div className="stat-content">
              <h3 className="stat-label">Total de Colaboradores</h3>
              <p className="stat-value">
                {statsLoading ? "—" : stats.colaboradores}
              </p>
              <span className="stat-ver-mais">
                Ver colaboradores <HiArrowRight />
              </span>
            </div>
          </div>

          <div
            className="stat-card stat-card-clickable"
            onClick={() => navigate(paths.documentacoes)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && navigate(paths.documentacoes)}
            aria-label="Ver documentos"
          >
            <div className="stat-icon stat-icon-orange">
              <HiDocumentText />
            </div>
            <div className="stat-content">
              <h3 className="stat-label">Documentos Pendentes</h3>
              <p className="stat-value stat-value-warning">
                {statsLoading ? "—" : stats.documentosPendentes}
              </p>
              <span className="stat-ver-mais">
                Ver documentações <HiArrowRight />
              </span>
            </div>
          </div>

          <div
            className="stat-card stat-card-clickable"
            onClick={() => navigate(paths.boletinsMedicao)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && navigate(paths.boletinsMedicao)}
            aria-label="Ver boletins"
          >
            <div className="stat-icon stat-icon-green">
              <HiClipboardList />
            </div>
            <div className="stat-content">
              <h3 className="stat-label">Boletins do Mês</h3>
              <p className="stat-value stat-value-success">
                {statsLoading ? "—" : stats.boletinsMes}
              </p>
              <span className="stat-ver-mais">
                Ver boletins <HiArrowRight />
              </span>
            </div>
          </div>

          <div
            className="stat-card stat-card-clickable"
            onClick={() => navigate(paths.premiosProdutividade)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && navigate(paths.premiosProdutividade)}
            aria-label="Ver prêmios"
          >
            <div className="stat-icon stat-icon-purple">
              <HiTrendingUp />
            </div>
            <div className="stat-content">
              <h3 className="stat-label">Prêmios Ativos</h3>
              <p className="stat-value stat-value-purple">
                {statsLoading ? "—" : stats.premiosAtivos}
              </p>
              <span className="stat-ver-mais">
                Ver prêmios <HiArrowRight />
              </span>
            </div>
          </div>

          <div
            className="stat-card stat-card-clickable"
            onClick={() => navigate(paths.documentacoes)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && navigate(paths.documentacoes)}
            aria-label="Ver integrações"
          >
            <div className="stat-icon stat-icon-teal">
              <HiLink />
            </div>
            <div className="stat-content">
              <h3 className="stat-label">Integrações Ativas</h3>
              <p className="stat-value stat-value-teal">
                {statsLoading ? "—" : stats.integracoesAtivas}
              </p>
              <span className="stat-ver-mais">
                Documentação e Integração <HiArrowRight />
              </span>
            </div>
          </div>

          <div
            className="stat-card stat-card-clickable"
            onClick={() => navigate(paths.documentacoes)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && navigate(paths.documentacoes)}
            aria-label="Ver integrações com erro"
          >
            <div className="stat-icon stat-icon-red">
              <HiExclamationCircle />
            </div>
            <div className="stat-content">
              <h3 className="stat-label">Integrações com Erro</h3>
              <p className="stat-value stat-value-danger">
                {statsLoading ? "—" : stats.integracoesComErro}
              </p>
              <span className="stat-ver-mais">
                Documentação e Integração <HiArrowRight />
              </span>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="notifications-section">
            <div className="section-header">
              <h2 className="section-title">Notificações e Alertas do Dia</h2>
              <div className="section-badge">
                {unreadCount} não lidas
              </div>
            </div>

            <div className="notifications-list">
              {todayNotifications.length > 0 ? (
                todayNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-card ${notification.type} ${
                      !notification.read ? "unread" : ""
                    }`}
                  >
                    <div className="notification-icon">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-content">
                      <div className="notification-header">
                        <h3 className="notification-title">
                          {notification.title}
                        </h3>
                        <div className="notification-actions">
                          {!notification.read && (
                            <button
                              className="notification-action"
                              onClick={() => markAsRead(notification.id)}
                              title="Marcar como lida"
                            >
                              <HiCheckCircle />
                            </button>
                          )}
                          <button
                            className="notification-action"
                            onClick={() => removeNotification(notification.id)}
                            title="Remover"
                          >
                            <HiX />
                          </button>
                        </div>
                      </div>
                      <p className="notification-message">
                        {notification.message}
                      </p>
                      <div className="notification-footer">
                        <span className="notification-category">
                          {getCategoryLabel(notification.category)}
                        </span>
                        <span className="notification-time">
                          {notification.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <HiCheckCircle className="empty-icon" />
                  <p>Nenhuma notificação para hoje</p>
                </div>
              )}
            </div>
          </div>

          <div className="alerts-section">
            <div className="section-header">
              <h2 className="section-title">Alertas Recentes</h2>
            </div>

            <div className="alerts-list">
              {notifications
                .filter((n) => n.type === "alert" || n.type === "warning")
                .slice(0, 3)
                .map((alert) => (
                  <div
                    key={alert.id}
                    className={`alert-card ${alert.type} ${
                      !alert.read ? "unread" : ""
                    }`}
                  >
                    <div className="alert-icon">
                      {getNotificationIcon(alert.type)}
                    </div>
                    <div className="alert-content">
                      <h3 className="alert-title">{alert.title}</h3>
                      <p className="alert-message">{alert.message}</p>
                      <div className="alert-footer">
                        <span className="alert-category">
                          {getCategoryLabel(alert.category)}
                        </span>
                        <span className="alert-time">{alert.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <h2 className="section-title">Ações Rápidas</h2>
          <div className="actions-grid">
            <button
              type="button"
              className="action-button"
              onClick={() => navigate(paths.documentacoes)}
              aria-label="Ver Documentações"
            >
              <span className="action-icon">
                <HiFolder />
              </span>
              <span>Ver Documentações</span>
            </button>
            <button
              type="button"
              className="action-button"
              onClick={() => navigate(paths.premiosProdutividade)}
              aria-label="Ver Prêmios"
            >
              <span className="action-icon">
                <HiTrendingUp />
              </span>
              <span>Ver Prêmios</span>
            </button>
            <button
              type="button"
              className="action-button"
              onClick={() => navigate(paths.boletinsMedicao)}
              aria-label="Ver Boletins"
            >
              <span className="action-icon">
                <HiClipboardList />
              </span>
              <span>Ver Boletins</span>
            </button>
            <button
              type="button"
              className="action-button"
              onClick={() => navigate(paths.documentacoes)}
              aria-label="Gerenciar Integrações"
            >
              <span className="action-icon">
                <HiLink />
              </span>
              <span>Gerenciar Integrações</span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
