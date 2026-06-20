import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const staticPageTitles = {
  '/admin/companies': 'Companies',
  '/admin/audits': 'Audit Logs',
};

const TopHeader = () => {
  const { user, companyName } = useAuth();
  const location = useLocation();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const getPageTitle = () => {
    const { pathname } = location;
    if (staticPageTitles[pathname]) return staticPageTitles[pathname];
    const prefix = companyName ? `${companyName} ` : '';
    if (pathname === '/submissions') return `${prefix}Submissions`;
    if (pathname === '/submit') return `${prefix}Submission Form`;
    if (pathname === '/form') return `${prefix}Form`;
    if (/\/admin\/companies\/[^/]+\/users/.test(pathname)) return 'Users';
    if (/\/admin\/companies\/[^/]+\/form/.test(pathname)) return 'Form Builder';
    return '';
  };

  const title = getPageTitle();

  return (
    <div style={{
      position: 'fixed', top: 0, left: 248, right: 0, height: 68,
      background: 'rgba(10,12,18,0.7)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', zIndex: 99,
    }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={title}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          style={{ fontSize: 19, fontWeight: 700, color: 'var(--text)' }}
        >
          {title}
        </motion.span>
      </AnimatePresence>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 13, color: 'var(--text-faint)', fontVariantNumeric: 'tabular-nums' }}>
          {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </span>
        <div style={{ width: 1, height: 24, background: 'var(--border)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 14, color: 'var(--text-dim)' }}>{user?.username}</span>
          <div style={{
            width: 36, height: 36, background: 'var(--grad-accent)', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 14, fontWeight: 700, flexShrink: 0,
            boxShadow: '0 6px 16px -6px var(--accent-glow)',
          }}>
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopHeader;
