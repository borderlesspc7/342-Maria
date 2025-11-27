import { NavLink } from "react-router-dom";
import {
  HiHome,
  HiTrendingUp,
  HiDocumentText,
  HiFolder,
  HiBookOpen,
  HiClipboardList,
  HiChartBar,
  HiChevronLeft,
  HiChevronRight,
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
      path: "/lancamentos-diarios",
      icon: HiClipboardList,
      label: "Lançamentos Diários",
    },
    {
      path: "/relatorios",
      icon: HiChartBar,
      label: "Relatórios",
    },
  ];

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">RH</div>
          {!collapsed && <span className="logo-text">Sistema RH</span>}
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

      <button
        className="sidebar-toggle"
        onClick={onToggle}
        aria-label="Toggle sidebar"
      >
        {collapsed ? <HiChevronRight /> : <HiChevronLeft />}
      </button>
    </aside>
  );
};

export default Sidebar;
