import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const BuildingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);
const ClipboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <line x1="9" y1="12" x2="15" y2="12" />
    <line x1="9" y1="16" x2="15" y2="16" />
  </svg>
);
const InboxIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);
const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
);
const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const Logo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M4 7l8-4 8 4v10l-8 4-8-4V7z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M12 3v18M4 7l8 4 8-4" stroke="white" strokeWidth="1.8" strokeLinejoin="round" opacity="0.85" />
  </svg>
);

const menuItemsByRole = {
  admin: [
    { key: 'companies', label: 'Companies', path: '/admin/companies', Icon: BuildingIcon },
    { key: 'audits', label: 'Audit Logs', path: '/admin/audits', Icon: ClipboardIcon },
  ],
  supervisor: [
    { key: 'submissions', label: 'Submissions', path: '/submissions', Icon: InboxIcon },
    { key: 'form', label: 'Form', path: '/form', Icon: ClipboardIcon },
  ],
  user: [
    { key: 'submit', label: 'Submit Form', path: '/submit', Icon: EditIcon },
  ],
};

const roleBadgeStyle = {
  admin: { background: 'rgba(99,102,241,0.2)', color: '#818cf8' },
  supervisor: { background: 'rgba(6,182,212,0.2)', color: '#22d3ee' },
  user: { background: 'rgba(34,197,94,0.2)', color: '#4ade80' },
};

const Sidebar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = menuItemsByRole[role] || [];

  const isActive = (path) => {
    if (path === '/admin/companies') {
      return location.pathname === '/admin/companies' || location.pathname.startsWith('/admin/companies/');
    }
    return location.pathname === path;
  };

  return (
    <motion.div
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed', left: 0, top: 0, width: 248, height: '100vh',
        background: 'linear-gradient(180deg, rgba(17,20,33,0.95), rgba(10,12,18,0.95))',
        borderRight: '1px solid var(--border)', backdropFilter: 'blur(12px)',
        display: 'flex', flexDirection: 'column', zIndex: 100,
      }}
    >
      <div style={{ height: 68, padding: '0 20px', boxSizing: 'border-box', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <motion.div
          whileHover={{ rotate: 8, scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          style={{
            width: 38, height: 38, background: 'var(--grad-accent)', borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, boxShadow: '0 8px 20px -6px var(--accent-glow)',
          }}
        >
          <Logo />
        </motion.div>
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ color: 'white', fontSize: 15, fontWeight: 700 }}>Jornaya</div>
          <div style={{ color: 'var(--text-dim)', fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Portal</div>
        </div>
      </div>

      <nav style={{ padding: '16px 12px', flex: 1 }}>
        {menuItems.map((item, i) => {
          const active = isActive(item.path);
          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                to={item.path}
                style={{
                  position: 'relative', display: 'flex', alignItems: 'center', gap: 12,
                  height: 46, padding: '0 14px', borderRadius: 10, marginBottom: 4,
                  textDecoration: 'none', color: active ? '#fff' : 'var(--text-dim)',
                  fontSize: 14, fontWeight: 500, transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = 'var(--text)'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'var(--text-dim)'; }}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    style={{
                      position: 'absolute', inset: 0, borderRadius: 10,
                      background: 'var(--grad-accent-soft)',
                      border: '1px solid rgba(99,102,241,0.35)',
                      boxShadow: '0 4px 16px -6px var(--accent-glow)',
                    }}
                  />
                )}
                <span style={{ position: 'relative', zIndex: 1, display: 'flex', color: active ? '#a5b4fc' : 'inherit' }}>
                  <item.Icon />
                </span>
                <span style={{ position: 'relative', zIndex: 1 }}>{item.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div style={{ borderTop: '1px solid var(--border)', padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 34, height: 34, background: 'var(--grad-accent)', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 14, fontWeight: 700, flexShrink: 0,
          }}>
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: 'var(--text)', fontSize: 14, fontWeight: 600, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.username}
            </div>
            {role && (
              <span style={{
                fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                padding: '2px 8px', borderRadius: 20, display: 'inline-block', marginTop: 2,
                ...(roleBadgeStyle[role] || {}),
              }}>
                {role}
              </span>
            )}
          </div>
        </div>
        <motion.button
          onClick={handleLogout}
          whileHover={{ x: 2 }}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)',
            fontSize: 14, padding: '8px 0', width: '100%', textAlign: 'left',
            fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', gap: 8,
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-dim)'; }}
        >
          <LogoutIcon />
          Sign out
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
