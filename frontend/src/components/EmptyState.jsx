import React from 'react';

const icons = {
  companies: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="20" width="48" height="36" rx="4" stroke="#2a2d3e" strokeWidth="2" fill="#1a1d2e"/>
      <rect x="16" y="8" width="32" height="16" rx="4" stroke="#2a2d3e" strokeWidth="2" fill="#13151f"/>
      <rect x="24" y="32" width="8" height="12" rx="2" fill="#2a2d3e"/>
      <rect x="36" y="32" width="8" height="8" rx="2" fill="#2a2d3e"/>
      <rect x="16" y="32" width="4" height="4" rx="1" fill="#4f6ef7"/>
      <rect x="44" y="32" width="4" height="4" rx="1" fill="#4f6ef7"/>
      <circle cx="32" cy="14" r="3" fill="#4f6ef7"/>
    </svg>
  ),
  users: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="20" r="10" stroke="#2a2d3e" strokeWidth="2" fill="#1a1d2e"/>
      <circle cx="24" cy="20" r="5" fill="#2a2d3e"/>
      <path d="M4 52c0-11 9-18 20-18s20 7 20 18" stroke="#2a2d3e" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <circle cx="46" cy="26" r="7" stroke="#4f6ef7" strokeWidth="2" fill="#13151f"/>
      <path d="M46 23v6M43 26h6" stroke="#4f6ef7" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  form: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="8" width="44" height="48" rx="6" stroke="#2a2d3e" strokeWidth="2" fill="#1a1d2e"/>
      <rect x="18" y="20" width="28" height="3" rx="1.5" fill="#2a2d3e"/>
      <rect x="18" y="28" width="20" height="3" rx="1.5" fill="#2a2d3e"/>
      <rect x="18" y="36" width="24" height="3" rx="1.5" fill="#2a2d3e"/>
      <circle cx="46" cy="46" r="10" fill="#13151f" stroke="#4f6ef7" strokeWidth="2"/>
      <path d="M42 46l3 3 5-5" stroke="#4f6ef7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  submissions: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="12" width="48" height="40" rx="6" stroke="#2a2d3e" strokeWidth="2" fill="#1a1d2e"/>
      <rect x="16" y="22" width="32" height="2" rx="1" fill="#2a2d3e"/>
      <rect x="16" y="28" width="24" height="2" rx="1" fill="#2a2d3e"/>
      <rect x="16" y="34" width="28" height="2" rx="1" fill="#2a2d3e"/>
      <rect x="16" y="40" width="16" height="2" rx="1" fill="#2a2d3e"/>
      <path d="M44 36l8-8" stroke="#4f6ef7" strokeWidth="2" strokeLinecap="round"/>
      <path d="M48 28h4v4" stroke="#4f6ef7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  audits: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="22" stroke="#2a2d3e" strokeWidth="2" fill="#1a1d2e"/>
      <path d="M32 20v12l8 4" stroke="#4f6ef7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="32" cy="32" r="3" fill="#4f6ef7"/>
    </svg>
  ),
};

const EmptyState = ({ type = 'submissions', title, description, action }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 24px',
      gap: 16,
    }}>
      <div style={{
        width: 96,
        height: 96,
        borderRadius: '50%',
        background: '#13151f',
        border: '1px solid #2a2d3e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {icons[type] || icons.submissions}
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#e8eaf6', marginBottom: 6 }}>
          {title || 'Nothing here yet'}
        </div>
        <div style={{ fontSize: 14, color: '#8b8fa8', maxWidth: 280, lineHeight: 1.6 }}>
          {description || 'No data to display at the moment.'}
        </div>
      </div>
      {action && (
        <div style={{ marginTop: 8 }}>
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
