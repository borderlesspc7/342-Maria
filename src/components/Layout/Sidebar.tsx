import { NavLink } from "react-router-dom";
import {
  HiHome,
  HiUserGroup,
  HiTrendingUp,
  HiDocumentText,
  HiFolder,
  HiBookOpen,
  HiChartBar,
  HiCurrencyDollar,
  HiBell,
  HiMenu,
} from "react-icons/hi";
import "./Sidebar.css";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const menuItems = [
    {
      path: "/dashboard",
      icon: HiHome,
      label: "Dashboard",
    },
    {
      path: "/notificacoes",
      icon: HiBell,
      label: "Notificações",
    },
    {
      path: "/colaboradores",
      icon: HiUserGroup,
      label: "Colaboradores",
    },
    {
      path: "/premios-produtividade",
      icon: HiTrendingUp,
      label: "Prêmio de Produtividade",
    },
    {
      path: "/boletins-medicao",
      icon: HiDocumentText,
      label: "Boletins de Medição",
    },
    {
      path: "/documentacoes",
      icon: HiFolder,
      label: "Documentações e Integrações",
    },
    {
      path: "/caderno-virtual",
      icon: HiBookOpen,
      label: "Caderno Virtual",
    },
    {
      path: "/financeiro",
      icon: HiCurrencyDollar,
      label: "Gestão Financeira",
    },
    {
      path: "/relatorios",
      icon: HiChartBar,
      label: "Relatórios",
    },
    {
      path: "/documentos-financeiros",
      icon: HiDocumentText,
      label: "Documentos Financeiros",
    },
  ];

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <button
            className="sidebar-menu-button"
            onClick={onToggle}
            aria-label="Toggle sidebar"
            title={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            <HiMenu className="menu-icon" />
          </button>
          {!collapsed && (
            <span className="sidebar-header-text">Sidebar</span>
          )}
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path} className="nav-item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                >
                  <Icon className="nav-icon" />
                  {!collapsed && (
                    <span className="nav-label">{item.label}</span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
