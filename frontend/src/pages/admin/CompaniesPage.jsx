import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Switch, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import EmptyState from '../../components/EmptyState';

const CompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await api.get('/companies');
      setCompanies(response.data);
    } catch (error) {
      message.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleCreateCompany = async (values) => {
    try {
      await api.post('/companies', values);
      message.success('Company created successfully');
      setIsModalOpen(false);
      form.resetFields();
      fetchCompanies();
    } catch (error) {
      message.error('Failed to create company');
    }
  };

  const handleToggleActive = async (record, checked) => {
    setTogglingId(record._id);
    setCompanies((prev) =>
      prev.map((c) => (c._id === record._id ? { ...c, is_active: checked } : c))
    );
    try {
      await api.patch(`/companies/${record._id}/active`, { is_active: checked });
      message.success(
        checked ? `${record.name} is now active` : `${record.name} is now inactive`
      );
    } catch (error) {
      setCompanies((prev) =>
        prev.map((c) => (c._id === record._id ? { ...c, is_active: !checked } : c))
      );
      message.error(error.response?.data?.detail || 'Failed to update company status');
    } finally {
      setTogglingId(null);
    }
  };

  const columns = [
    {
      title: 'Company Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span style={{ fontWeight: 500, color: '#e8eaf6' }}>{text}</span>,
    },
    {
      title: 'Contact Email',
      dataIndex: 'contact_email',
      key: 'contact_email',
      render: (text) => <span style={{ color: '#8b8fa8' }}>{text || '—'}</span>,
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      render: (text) => <span style={{ color: '#8b8fa8' }}>{text || '—'}</span>,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const active = !!record.is_active;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Switch
              checked={active}
              loading={togglingId === record._id}
              onChange={(checked) => handleToggleActive(record, checked)}
              size="small"
            />
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '2px 10px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 500,
                background: active ? 'rgba(34,197,94,0.12)' : 'rgba(139,143,168,0.12)',
                border: `1px solid ${active ? 'rgba(34,197,94,0.35)' : 'rgba(139,143,168,0.3)'}`,
                color: active ? '#22c55e' : '#8b8fa8',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: active ? '#22c55e' : '#8b8fa8',
                }}
              />
              {active ? 'Active' : 'Inactive'}
            </span>
          </div>
        );
      },
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
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            size="small"
            onClick={() => navigate(`/admin/companies/${record._id}/users`)}
            style={{
              background: 'transparent',
              borderColor: '#2a2d3e',
              color: '#8b8fa8',
              borderRadius: 6,
            }}
          >
            Users
          </Button>
          <Button
            size="small"
            onClick={() => navigate(`/admin/companies/${record._id}/form`)}
            style={{
              background: 'transparent',
              borderColor: '#2a2d3e',
              color: '#8b8fa8',
              borderRadius: 6,
            }}
          >
            Manage Form
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#e8eaf6', margin: 0 }}>Companies</h1>
          <p style={{ fontSize: 14, color: '#8b8fa8', margin: '4px 0 0' }}>Manage all companies in the system</p>
        </div>
        <Button
          type="primary"
          onClick={() => setIsModalOpen(true)}
          style={{ height: 40, borderRadius: 8, fontWeight: 500 }}
        >
          Add Company
        </Button>
      </div>

      <div style={{
        background: '#1a1d2e',
        border: '1px solid #2a2d3e',
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        <Table
          dataSource={companies}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 20 }}
          locale={{
            emptyText: (
              <EmptyState
                type="companies"
                title="No companies yet"
                description="Create your first company to get started managing users and forms."
              />
            ),
          }}
        />
      </div>

      <Modal
        title="Create Company"
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); form.resetFields(); }}
        footer={null}
        width={480}
      >
        <Form form={form} onFinish={handleCreateCompany} layout="vertical" style={{ marginTop: 16 }} requiredMark={false}>
          <Form.Item name="name" label="Company Name" rules={[{ required: true, message: 'Name is required' }]}>
            <Input placeholder="Acme Corp" />
          </Form.Item>
          <Form.Item name="contact_email" label="Contact Email">
            <Input type="email" placeholder="contact@company.com" />
          </Form.Item>
          <Form.Item name="address" label="Address">
            <Input placeholder="123 Main St" />
          </Form.Item>
          <Form.Item name="company_secret" label="Company Secret">
            <Input placeholder="Secret key" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block style={{ height: 44, fontWeight: 600 }}>
              Create Company
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CompaniesPage;
