import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiBell, HiUser, HiLogout, HiCog, HiMenu } from 'react-icons/hi';
import { useAuth } from '../../hooks/useAuth';
import './Header.css';

interface HeaderProps {
  onMenuClick: () => void;
  collapsed?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, collapsed = false }) => {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <header className={`header ${collapsed ? "sidebar-collapsed" : ""}`}>
      <div className="header-left">
        <button className="menu-toggle" onClick={onMenuClick} aria-label="Toggle menu">
          <HiMenu />
        </button>
        <h1 className="header-title">Sistema de Gestão RH</h1>
      </div>

      <div className="header-right">
        <div className="header-actions">
          <div className="notification-container">
            <button
              className="icon-button"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notificações"
            >
              <HiBell />
              <span className="notification-badge">3</span>
            </button>

            {showNotifications && (
              <div className="dropdown-menu notifications-menu">
                <div className="dropdown-header">
                  <h3>Notificações</h3>
                  <button className="mark-read">Marcar todas como lidas</button>
                </div>
                <ul className="notification-list">
                  <li className="notification-item unread">
                    <div className="notification-content">
                      <p className="notification-title">Novo boletim de medição</p>
                      <p className="notification-text">Boletim de outubro foi adicionado</p>
                      <span className="notification-time">Há 2 horas</span>
                    </div>
                  </li>
                  <li className="notification-item unread">
                    <div className="notification-content">
                      <p className="notification-title">Documentação vencendo</p>
                      <p className="notification-text">3 documentos vencem em 5 dias</p>
                      <span className="notification-time">Há 5 horas</span>
                    </div>
                  </li>
                  <li className="notification-item unread">
                    <div className="notification-content">
                      <p className="notification-title">Relatório disponível</p>
                      <p className="notification-text">Relatório mensal foi gerado</p>
                      <span className="notification-time">Ontem</span>
                    </div>
                  </li>
                </ul>
                <div className="dropdown-footer">
                  <button className="view-all">Ver todas as notificações</button>
                </div>
              </div>
            )}
          </div>

          <div className="user-container">
            <button
              className="user-button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-label="Menu do usuário"
            >
              <div className="user-avatar">
                <HiUser />
              </div>
              <div className="user-info">
                <span className="user-name">{user?.name || 'Usuário'}</span>
                <span className="user-role">{user?.role === 'admin' ? 'Administrador' : 'Colaborador'}</span>
              </div>
            </button>

            {showUserMenu && (
              <div className="dropdown-menu user-menu">
                <div className="user-menu-header">
                  <div className="user-avatar-large">
                    <HiUser />
                  </div>
                  <div className="user-details">
                    <p className="user-name-large">{user?.name || 'Usuário'}</p>
                    <p className="user-email">{user?.email || 'email@empresa.com'}</p>
                  </div>
                </div>
                <ul className="menu-list">
                  <li>
                    <button className="menu-item" onClick={() => navigate('/perfil')}>
                      <HiUser />
                      <span>Meu Perfil</span>
                    </button>
                  </li>
                  <li>
                    <button className="menu-item" onClick={() => navigate('/configuracoes')}>
                      <HiCog />
                      <span>Configurações</span>
                    </button>
                  </li>
                  <li className="menu-divider"></li>
                  <li>
                    <button className="menu-item logout" onClick={handleLogout}>
                      <HiLogout />
                      <span>Sair</span>
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {(showUserMenu || showNotifications) && (
        <div
          className="overlay"
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;

