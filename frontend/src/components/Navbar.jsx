import React from 'react';
import { Layout, Menu, Button, Typography } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header } = Layout;
const { Text } = Typography;

const Navbar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getMenuItems = () => {
    if (role === 'admin') {
      return [
        { key: 'companies', label: <Link to="/admin/companies">Companies</Link> },
        { key: 'audits', label: <Link to="/admin/audits">Audits</Link> }
      ];
    }
    if (role === 'supervisor') {
      return [
        { key: 'submissions', label: <Link to="/submissions">Submissions</Link> }
      ];
    }
    if (role === 'user') {
      return [
        { key: 'submit', label: <Link to="/submit">Submit Form</Link> }
      ];
    }
    return [];
  };

  return (
    <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#001529' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Text strong style={{ color: 'white', fontSize: '18px' }}>Form Dashboard</Text>
        <Menu
          theme="dark"
          mode="horizontal"
          items={getMenuItems()}
          style={{ minWidth: 300, background: 'transparent' }}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <Text style={{ color: 'white' }}>
          {user?.username} ({role})
        </Text>
        <Button type="primary" danger onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </Header>
  );
};

export default Navbar;
