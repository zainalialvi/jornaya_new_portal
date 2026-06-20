import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import EmptyState from '../../components/EmptyState';

const rolePillStyle = {
  supervisor: { background: 'rgba(6,182,212,0.15)', color: '#06b6d4' },
  user: { background: 'rgba(34,197,94,0.15)', color: '#22c55e' },
};

const UsersPage = () => {
  const { id: companyId } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/companies/${companyId}/users`);
      setUsers(response.data);
    } catch (error) {
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [companyId]);

  const handleCreateUser = async (values) => {
    try {
      await api.post(`/companies/${companyId}/users`, values);
      message.success('User created successfully');
      setIsModalOpen(false);
      form.resetFields();
      fetchUsers();
    } catch (error) {
      message.error(error.response?.data?.detail || 'Failed to create user');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
      message.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      message.error('Failed to delete user');
    }
  };

  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      render: (text) => <span style={{ fontWeight: 500, color: '#e8eaf6' }}>{text}</span>,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <span style={{
          fontSize: 12,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          padding: '3px 10px',
          borderRadius: 20,
          display: 'inline-block',
          ...(rolePillStyle[role] || { background: 'rgba(139,143,168,0.15)', color: '#8b8fa8' }),
        }}>
          {role}
        </span>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => {
        const d = new Date(text);
        return (
          <span style={{ color: '#8b8fa8', fontSize: 13 }}>
            {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Popconfirm
          title="Delete this user?"
          description="This action cannot be undone."
          onConfirm={() => handleDeleteUser(record._id)}
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
        >
          <Button
            danger
            size="small"
            style={{ borderRadius: 6 }}
          >
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <button
            onClick={() => navigate('/admin/companies')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#8b8fa8',
              fontSize: 13,
              fontWeight: 500,
              padding: '0 0 8px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: "'Inter', sans-serif",
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#4f6ef7'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#8b8fa8'; }}
          >
            ← Back to Companies
          </button>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#e8eaf6', margin: 0 }}>Users</h1>
          <p style={{ fontSize: 14, color: '#8b8fa8', margin: '4px 0 0' }}>Manage users for this company</p>
        </div>
        <Button
          type="primary"
          onClick={() => setIsModalOpen(true)}
          style={{ height: 40, borderRadius: 8, fontWeight: 500 }}
        >
          Add User
        </Button>
      </div>

      <div style={{
        background: '#1a1d2e',
        border: '1px solid #2a2d3e',
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        <Table
          dataSource={users}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 20 }}
          locale={{
            emptyText: (
              <EmptyState
                type="users"
                title="No users yet"
                description="Add supervisors and users to this company so they can access the dashboard."
              />
            ),
          }}
        />
      </div>

      <Modal
        title="Create User"
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); form.resetFields(); }}
        footer={null}
        width={440}
      >
        <Form form={form} onFinish={handleCreateUser} layout="vertical" style={{ marginTop: 16 }} requiredMark={false}>
          <Form.Item name="username" label="Username" rules={[{ required: true, message: 'Username is required' }]}>
            <Input placeholder="john_doe" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Password is required' }]}>
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true, message: 'Role is required' }]}>
            <Select placeholder="Select role">
              <Select.Option value="supervisor">Supervisor</Select.Option>
              <Select.Option value="user">User</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block style={{ height: 44, fontWeight: 600 }}>
              Create User
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UsersPage;
