import React, { useState, useEffect } from 'react';
import { Table, Button, Select, DatePicker, Input, message, Drawer } from 'antd';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import EmptyState from '../../components/EmptyState';
import { Stagger, HoverCard, CountUp, FadeInUp } from '../../components/motion';

const { RangePicker } = DatePicker;

const statusStyle = {
  pending: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  processing: { bg: 'rgba(79,110,247,0.15)', color: '#4f6ef7' },
  submitted: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
  failed: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
};

const StatusBadge = ({ status }) => {
  const s = statusStyle[status] || { bg: 'rgba(139,143,168,0.15)', color: '#8b8fa8' };
  return (
    <span style={{
      fontSize: 12,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      padding: '3px 10px',
      borderRadius: 20,
      display: 'inline-block',
      background: s.bg,
      color: s.color,
    }}>
      {status}
    </span>
  );
};

const ExportIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const InfoRow = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #2a2d3e' }}>
    <span style={{ fontSize: 13, color: '#8b8fa8', fontWeight: 500 }}>{label}</span>
    <span style={{ fontSize: 13, color: '#e8eaf6' }}>{value}</span>
  </div>
);

const formatTimestamp = (ts) => {
  if (!ts) return '—';
  const d = new Date(ts);
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return `${date} · ${time}`;
};

const STAT_CARDS = [
  { key: 'total',     label: 'Total',     color: '#e8eaf6', sublabel: 'All submissions' },
  { key: 'pending',   label: 'Pending',   color: '#f59e0b', sublabel: 'Awaiting processing' },
  { key: 'submitted', label: 'Submitted', color: '#22c55e', sublabel: 'Successfully processed' },
  { key: 'failed',    label: 'Failed',    color: '#ef4444', sublabel: 'Needs attention' },
];

const SubmissionsPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [filters, setFilters] = useState({});
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, submitted: 0, failed: 0 });
  const { companyId, role } = useAuth();

  const fetchSubmissions = async (page = 1, pageSize = 20, filterParams = {}) => {
    setLoading(true);
    try {
      const params = { page, per_page: pageSize, ...filterParams };
      if (role === 'supervisor') params.company_id = companyId;
      const response = await api.get('/submissions', { params });
      setSubmissions(response.data.items);
      setPagination({
        current: response.data.page,
        pageSize: response.data.per_page,
        total: response.data.total,
      });
    } catch (error) {
      message.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const baseParams = { per_page: 1 };
      if (role === 'supervisor') baseParams.company_id = companyId;
      const [allRes, pendingRes, submittedRes, failedRes] = await Promise.all([
        api.get('/submissions', { params: baseParams }),
        api.get('/submissions', { params: { ...baseParams, status: 'pending' } }),
        api.get('/submissions', { params: { ...baseParams, status: 'submitted' } }),
        api.get('/submissions', { params: { ...baseParams, status: 'failed' } }),
      ]);
      setStats({
        total: allRes.data.total || 0,
        pending: pendingRes.data.total || 0,
        submitted: submittedRes.data.total || 0,
        failed: failedRes.data.total || 0,
      });
    } catch (err) {
      // stats are non-critical, fail silently
    }
  };

  useEffect(() => {
    fetchSubmissions();
    fetchStats();
  }, []);

  const handleTableChange = (newPagination) => {
    fetchSubmissions(newPagination.current, newPagination.pageSize, filters);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchSubmissions(1, pagination.pageSize, newFilters);
  };

  const handleExport = async () => {
    try {
      const params = { ...filters };
      if (role === 'supervisor') params.company_id = companyId;
      const response = await api.get('/submissions/export', { params, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'submissions_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success('Export successful');
    } catch (error) {
      message.error('Failed to export submissions');
    }
  };

  const handleViewDetails = async (submissionId) => {
    try {
      const response = await api.get(`/submissions/${submissionId}`);
      setSelectedSubmission(response.data);
      setDrawerVisible(true);
    } catch (error) {
      message.error('Failed to load submission details');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: '_id',
      key: '_id',
      render: (text) => (
        <span style={{ color: '#555870', fontSize: 12, fontFamily: 'monospace' }}>
          {text.substring(0, 8)}...
        </span>
      ),
    },
    {
      title: 'User',
      dataIndex: 'username',
      key: 'username',
      render: (text) => <span style={{ fontWeight: 500, color: '#e8eaf6' }}>{text}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'form_status',
      key: 'form_status',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      title: 'Attempts',
      dataIndex: 'submission_attempts',
      key: 'submission_attempts',
      render: (attempts, record) => (
        <span style={{ color: '#8b8fa8', fontSize: 13 }}>
          {record.max_attempts ? `${attempts} / ${record.max_attempts}` : attempts}
        </span>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => (
        <span style={{ color: '#8b8fa8', fontSize: 13 }}>{formatTimestamp(text)}</span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          size="small"
          onClick={() => handleViewDetails(record._id)}
          style={{ borderColor: '#2a2d3e', color: '#8b8fa8', borderRadius: 6, background: 'transparent' }}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 14, color: '#8b8fa8', margin: 0 }}>Review and manage form submissions</p>
      </div>

      {/* Stats bar */}
      <Stagger style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        {STAT_CARDS.map(({ key, label, color, sublabel }) => (
          <Stagger.Item key={key}>
            <HoverCard
              className="glass"
              style={{
                borderLeft: `3px solid ${color}`,
                borderRadius: 14,
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                cursor: 'default',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {label}
              </div>
              <CountUp value={stats[key]} style={{ fontSize: 30, fontWeight: 800, color, lineHeight: 1.2 }} />
              <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>
                {sublabel}
              </div>
            </HoverCard>
          </Stagger.Item>
        ))}
      </Stagger>

      {/* Filter bar */}
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
          placeholder="Filter by status"
          style={{ width: 160 }}
          allowClear
          onChange={(value) => handleFilterChange('status', value)}
        >
          <Select.Option value="pending">
            <span style={{ color: '#f59e0b' }}>● </span>Pending
          </Select.Option>
          <Select.Option value="processing">
            <span style={{ color: '#4f6ef7' }}>● </span>Processing
          </Select.Option>
          <Select.Option value="submitted">
            <span style={{ color: '#22c55e' }}>● </span>Submitted
          </Select.Option>
          <Select.Option value="failed">
            <span style={{ color: '#ef4444' }}>● </span>Failed
          </Select.Option>
        </Select>
        <RangePicker
          onChange={(dates) => {
            if (dates) {
              const newFilters = { ...filters, from: dates[0].toISOString(), to: dates[1].toISOString() };
              setFilters(newFilters);
              fetchSubmissions(1, pagination.pageSize, newFilters);
            } else {
              const newFilters = { ...filters };
              delete newFilters.from;
              delete newFilters.to;
              setFilters(newFilters);
              fetchSubmissions(1, pagination.pageSize, newFilters);
            }
          }}
        />
        <Input
          placeholder="Search..."
          style={{ width: 200 }}
          onChange={(e) => handleFilterChange('q', e.target.value)}
        />
        <div style={{ marginLeft: 'auto' }}>
          <Button
            onClick={handleExport}
            style={{
              borderColor: '#2a2d3e',
              color: '#4f6ef7',
              background: 'transparent',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ExportIcon />
            Export CSV
          </Button>
        </div>
      </div>

      <div style={{ background: '#1a1d2e', border: '1px solid #2a2d3e', borderRadius: 12, overflow: 'hidden' }}>
        <Table
          dataSource={submissions}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          locale={{
            emptyText: (
              <EmptyState
                type="submissions"
                title="No submissions found"
                description="No submissions match your current filters. Try adjusting the date range or status filter."
              />
            ),
          }}
        />
      </div>

      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: '#e8eaf6', fontWeight: 600 }}>Submission Details</span>
            {selectedSubmission && <StatusBadge status={selectedSubmission.form_status} />}
          </div>
        }
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={520}
        styles={{ body: { padding: '20px 24px' }, header: { borderBottom: '1px solid #2a2d3e' } }}
      >
        {selectedSubmission && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#8b8fa8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                Submission Info
              </div>
              <InfoRow label="Status" value={<StatusBadge status={selectedSubmission.form_status} />} />
              <InfoRow label="Created" value={formatTimestamp(selectedSubmission.created_at)} />
              <InfoRow label="Attempts" value={selectedSubmission.submission_attempts} />
            </div>

            {selectedSubmission.data && Object.keys(selectedSubmission.data).length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#8b8fa8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                  Form Data
                </div>
                {Object.entries(selectedSubmission.data).map(([key, value], i) => (
                  <div
                    key={key}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      borderBottom: '1px solid #2a2d3e',
                      background: i % 2 === 0 ? '#13151f' : 'transparent',
                    }}
                  >
                    <span style={{ fontSize: 13, color: '#8b8fa8', fontWeight: 500 }}>{key}</span>
                    <span style={{ fontSize: 13, color: '#e8eaf6', maxWidth: '60%', textAlign: 'right', wordBreak: 'break-word' }}>
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {(selectedSubmission.bot_response || selectedSubmission.jornaya_id || selectedSubmission.ip_address) && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#8b8fa8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                  Fillo Response
                </div>
                {selectedSubmission.jornaya_id && (
                  <InfoRow label="Jornaya ID" value={<span style={{ fontFamily: 'monospace', fontSize: 12 }}>{selectedSubmission.jornaya_id}</span>} />
                )}
                {selectedSubmission.ip_address && (
                  <InfoRow label="IP Address" value={<span style={{ fontFamily: 'monospace', fontSize: 12 }}>{selectedSubmission.ip_address}</span>} />
                )}
                {selectedSubmission.bot_response && (
                  <pre style={{
                    background: '#0f1117',
                    border: '1px solid #2a2d3e',
                    borderRadius: 8,
                    padding: 12,
                    fontFamily: 'monospace',
                    fontSize: 12,
                    color: '#22c55e',
                    margin: '12px 0 0',
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                  }}>
                    {JSON.stringify(selectedSubmission.bot_response, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default SubmissionsPage;
