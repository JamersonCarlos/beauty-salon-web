import { Outlet, NavLink } from 'react-router-dom';
// Adicionei LayoutDashboard, Sparkles e Package aos imports
import {
  Settings,
  LogOut,
  Scissors,
  LayoutDashboard,
  Sparkles,
  Package,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './MenuLateral.module.css';

export function MenuLateral() {
  const { logout } = useAuth();

  return (
    <div className={styles.layoutContainer}>
      <aside className={styles.sidebar}>
        {/* Logo */}
        <div className={styles.logoHeader}>
          <Scissors className={styles.logoIcon} size={24} strokeWidth={1.5} />
          <span className={styles.brandName}>Belle Salon</span>
        </div>

        <nav className={styles.navContainer}>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
            }
          >
            <LayoutDashboard size={20} className={styles.navIcon} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/servicos"
            className={({ isActive }) =>
              isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
            }
          >
            <Sparkles size={20} className={styles.navIcon} />
            <span>Serviços</span>
          </NavLink>

          <NavLink
            to="/produtos"
            className={({ isActive }) =>
              isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
            }
          >
            <Package size={20} className={styles.navIcon} />
            <span>Produtos</span>
          </NavLink>

          <NavLink
            to="/config"
            className={({ isActive }) =>
              isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
            }
          >
            <Settings size={20} className={styles.navIcon} />
            <span>Configurações</span>
          </NavLink>
        </nav>

        <div className={styles.footer}>
          <button onClick={logout} className={styles.logoutBtn}>
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
