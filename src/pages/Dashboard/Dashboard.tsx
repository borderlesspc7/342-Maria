import React, { useState } from "react";
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
} from "react-icons/hi";
import "./Dashboard.css";

interface Notification {
  id: string;
  type: "alert" | "info" | "success" | "warning";
  title: string;
  message: string;
  time: string;
  category: "integracao" | "premio" | "boletim" | "documentacao" | "geral";
  read: boolean;
}

const Dashboard: React.FC = () => {
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

  const stats = {
    colaboradores: 248,
    documentosPendentes: 12,
    boletinsMes: 8,
    premiosAtivos: 5,
    integracoesAtivas: 6,
    integracoesComErro: 2,
  };

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
          <div className="stat-card">
            <div className="stat-icon stat-icon-blue">
              <HiUsers />
            </div>
            <div className="stat-content">
              <h3 className="stat-label">Total de Colaboradores</h3>
              <p className="stat-value">{stats.colaboradores}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-orange">
              <HiDocumentText />
            </div>
            <div className="stat-content">
              <h3 className="stat-label">Documentos Pendentes</h3>
              <p className="stat-value stat-value-warning">
                {stats.documentosPendentes}
              </p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-green">
              <HiClipboardList />
            </div>
            <div className="stat-content">
              <h3 className="stat-label">Boletins do Mês</h3>
              <p className="stat-value stat-value-success">
                {stats.boletinsMes}
              </p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-purple">
              <HiTrendingUp />
            </div>
            <div className="stat-content">
              <h3 className="stat-label">Prêmios Ativos</h3>
              <p className="stat-value stat-value-purple">
                {stats.premiosAtivos}
              </p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-teal">
              <HiLink />
            </div>
            <div className="stat-content">
              <h3 className="stat-label">Integrações Ativas</h3>
              <p className="stat-value stat-value-teal">
                {stats.integracoesAtivas}
              </p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-red">
              <HiExclamationCircle />
            </div>
            <div className="stat-content">
              <h3 className="stat-label">Integrações com Erro</h3>
              <p className="stat-value stat-value-danger">
                {stats.integracoesComErro}
              </p>
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
            <button className="action-button">
              <HiFolder />
              <span>Ver Documentações</span>
            </button>
            <button className="action-button">
              <HiTrendingUp />
              <span>Ver Prêmios</span>
            </button>
            <button className="action-button">
              <HiClipboardList />
              <span>Ver Boletins</span>
            </button>
            <button className="action-button">
              <HiLink />
              <span>Gerenciar Integrações</span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
