import React, { useState, useEffect } from 'react';
import { Table, Select, DatePicker, message, Tooltip } from 'antd';
import api from '../../api/axios';
import EmptyState from '../../components/EmptyState';

const { RangePicker } = DatePicker;

const formatTimestamp = (ts) => {
  const d = new Date(ts);
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return `${date} · ${time}`;
};

const getActionBadge = (actionType) => {
  if (!actionType) return { bg: 'rgba(139,143,168,0.15)', color: '#8b8fa8' };
  if (actionType.startsWith('create_')) return { bg: 'rgba(34,197,94,0.15)', color: '#22c55e' };
  if (actionType.startsWith('delete_')) return { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' };
  if (actionType.startsWith('bot_')) return { bg: 'rgba(79,110,247,0.15)', color: '#4f6ef7' };
  if (actionType === 'auto_failed') return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' };
  return { bg: 'rgba(139,143,168,0.15)', color: '#8b8fa8' };
};

const AuditsPage = () => {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [filters, setFilters] = useState({});

  const fetchAudits = async (page = 1, pageSize = 20, filterParams = {}) => {
    setLoading(true);
    try {
      const params = { page, per_page: pageSize, ...filterParams };
      const response = await api.get('/audits', { params });
      setAudits(response.data.items);
      setPagination({
        current: response.data.page,
        pageSize: response.data.per_page,
        total: response.data.total,
      });
    } catch (error) {
      message.error('Failed to load audits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  const handleTableChange = (newPagination) => {
    fetchAudits(newPagination.current, newPagination.pageSize, filters);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchAudits(1, pagination.pageSize, newFilters);
  };

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (text) => (
        <span style={{ color: '#8b8fa8', fontSize: 13 }}>{formatTimestamp(text)}</span>
      ),
    },
    {
      title: 'Actor',
      dataIndex: 'actor_user_id',
      key: 'actor_user_id',
      render: (text) => (
        <span style={{ color: text ? '#e8eaf6' : '#555870', fontWeight: text ? 500 : 400 }}>
          {text || 'System'}
        </span>
      ),
    },
    {
      title: 'Action Type',
      dataIndex: 'action_type',
      key: 'action_type',
      render: (actionType) => {
        const badge = getActionBadge(actionType);
        return (
          <span style={{
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            padding: '3px 10px',
            borderRadius: 20,
            display: 'inline-block',
            background: badge.bg,
            color: badge.color,
          }}>
            {actionType}
          </span>
        );
      },
    },
    {
      title: 'Target',
      dataIndex: 'target_collection',
      key: 'target_collection',
      render: (text) => <span style={{ color: '#8b8fa8', fontSize: 13 }}>{text || '—'}</span>,
    },
    {
      title: 'Target ID',
      dataIndex: 'target_id',
      key: 'target_id',
      render: (text) => (
        <span style={{ color: '#555870', fontSize: 12, fontFamily: 'monospace' }}>
          {text ? text.substring(0, 12) + '...' : '—'}
        </span>
      ),
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      render: (details) => {
        const str = JSON.stringify(details);
        const preview = str.length > 45 ? str.substring(0, 45) + '...' : str;
        return (
          <Tooltip
            title={<pre style={{ margin: 0, fontSize: 12, maxWidth: 360, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{JSON.stringify(details, null, 2)}</pre>}
            color="#1f2235"
            overlayInnerStyle={{ border: '1px solid #2a2d3e', borderRadius: 8 }}
          >
            <span style={{ color: '#555870', fontSize: 12, fontFamily: 'monospace', cursor: 'pointer' }}>
              {preview}
            </span>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#e8eaf6', margin: 0 }}>Audit Logs</h1>
        <p style={{ fontSize: 14, color: '#8b8fa8', margin: '4px 0 0' }}>Track all system actions and events</p>
      </div>

      <div style={{
        background: '#1a1d2e',
        border: '1px solid #2a2d3e',
        borderRadius: 12,
        padding: '16px 20px',
        marginBottom: 20,
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <Select
          placeholder="Filter by action type"
          style={{ width: 200 }}
          allowClear
          onChange={(value) => handleFilterChange('action_type', value)}
        >
          <Select.Option value="create_company">Create Company</Select.Option>
          <Select.Option value="create_form">Create Form</Select.Option>
          <Select.Option value="delete_form">Delete Form</Select.Option>
          <Select.Option value="create_user">Create User</Select.Option>
          <Select.Option value="delete_user">Delete User</Select.Option>
          <Select.Option value="create_submission">Create Submission</Select.Option>
          <Select.Option value="bot_result">Bot Result</Select.Option>
          <Select.Option value="auto_failed">Auto Failed</Select.Option>
        </Select>
        <RangePicker
          onChange={(dates) => {
            if (dates) {
              const newFilters = { ...filters, from: dates[0].toISOString(), to: dates[1].toISOString() };
              setFilters(newFilters);
              fetchAudits(1, pagination.pageSize, newFilters);
            } else {
              const newFilters = { ...filters };
              delete newFilters.from;
              delete newFilters.to;
              setFilters(newFilters);
              fetchAudits(1, pagination.pageSize, newFilters);
            }
          }}
        />
      </div>

      <div style={{ background: '#1a1d2e', border: '1px solid #2a2d3e', borderRadius: 12, overflow: 'hidden' }}>
        <Table
          dataSource={audits}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          locale={{
            emptyText: (
              <EmptyState
                type="audits"
                title="No audit logs yet"
                description="Audit logs will appear here as actions are performed in the system."
              />
            ),
          }}
        />
      </div>
    </div>
  );
};

export default AuditsPage;
