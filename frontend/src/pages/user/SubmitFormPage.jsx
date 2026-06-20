import React, { useState, useEffect } from 'react';
import { Button, Form, message } from 'antd';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import FormRenderer from '../../components/FormRenderer';
import Fillo from '../../components/Fillo';
import { useAuth } from '../../context/AuthContext';
import { easeOutExpo } from '../../components/motion';

const Logo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M4 7l8-4 8 4v10l-8 4-8-4V7z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M12 3v18M4 7l8 4 8-4" stroke="white" strokeWidth="1.8" strokeLinejoin="round" opacity="0.85" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const CheckIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const SubmitFormPage = () => {
  const [formSchema, setFormSchema] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { companyId, companyName, user, logout } = useAuth();
  const navigate = useNavigate();
  const { control, handleSubmit, reset, formState: { errors } } = useForm();

  const handleSubmitAnother = () => {
    reset();
    setSubmitted(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchForm = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/companies/${companyId}/form`);
      setFormSchema(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        message.error('No form available for your company');
      } else {
        message.error('Failed to load form');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) fetchForm();
  }, [companyId]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await api.post('/submissions', {
        company_id: companyId,
        form_id: formSchema._id,
        data,
      });
      setSubmitted(true);
    } catch (error) {
      if (error.response?.data?.detail?.errors) {
        message.error(`Validation failed: ${error.response.data.detail.errors.join(', ')}`);
      } else {
        message.error(error.response?.data?.detail || 'Failed to submit form');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const card = {
    width: '100%',
    maxWidth: 480,
    borderRadius: 20,
    padding: '36px 40px',
    boxShadow: '0 30px 70px -20px rgba(0,0,0,0.6)',
    borderTop: '1px solid rgba(99,102,241,0.4)',
  };

  const renderFormSide = () => {
    if (loading) {
      return (
        <div className="glass" style={{ ...card, textAlign: 'center', padding: '60px 40px', color: 'var(--text-dim)' }}>
          Loading form…
        </div>
      );
    }
    if (submitted) {
      return (
        <div className="glass" style={{ ...card, textAlign: 'center', padding: '56px 40px' }}>
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 13 }}
            style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
            }}
          >
            <CheckIcon />
          </motion.div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: '0 0 12px' }}>
            Submitted — thank you!
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-dim)', margin: '0 0 24px' }}>
            Fillo has your submission and is processing it now.
          </p>
          <Button type="primary" onClick={handleSubmitAnother}
            style={{ height: 44, padding: '0 24px', fontSize: 14, fontWeight: 600, borderRadius: 10 }}>
            Submit Another Response
          </Button>
        </div>
      );
    }
    if (!formSchema) {
      return (
        <div className="glass" style={{ ...card, textAlign: 'center', padding: '48px 40px' }}>
          <p style={{ color: 'var(--text-dim)', fontSize: 14, margin: 0 }}>
            No form available. Please contact your administrator.
          </p>
        </div>
      );
    }
    return (
      <div className="glass" style={card}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: '0 0 6px' }}>
            Fill out the form
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-dim)', margin: 0 }}>
            Complete all required fields and submit.
          </p>
        </div>
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)} requiredMark={false}>
          <FormRenderer schema={formSchema.schema} control={control} errors={errors} />
          <Form.Item style={{ marginTop: 8, marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={submitting} block
              style={{ height: 48, fontSize: 15, fontWeight: 600, borderRadius: 10 }}>
              {submitting ? 'Submitting…' : 'Submit Form'}
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', background: 'var(--bg-base)' }}>
      <div className="aurora" />
      <div className="grid-overlay" />

      {/* top bar — company name + sign out (no sidebar) */}
      <header style={{
        height: 68, flexShrink: 0, position: 'relative', zIndex: 2,
        borderBottom: '1px solid var(--border)', background: 'rgba(10,12,18,0.6)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, background: 'var(--grad-accent)', borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            boxShadow: '0 8px 20px -6px var(--accent-glow)',
          }}>
            <Logo />
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
            {companyName || 'Submission Form'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 14, color: 'var(--text-dim)' }}>{user?.username}</span>
          <button onClick={handleLogout}
            style={{
              background: 'none', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer',
              color: 'var(--text-dim)', fontSize: 13, padding: '7px 12px', display: 'flex',
              alignItems: 'center', gap: 7, fontFamily: "'Inter', sans-serif", transition: 'color 0.2s, border-color 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <LogoutIcon /> Sign out
          </button>
        </div>
      </header>

      {/* body — Fillo on one side, form on the other, sharing the same background */}
      <div className="user-stage">
        <div className="user-bot-pane">
          <Fillo />
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: easeOutExpo, delay: 0.3 }}
            style={{ textAlign: 'center', marginTop: 24, padding: '0 24px' }}
          >
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0 }} className="gradient-text">
              Hi, I'm Fillo 👋
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-dim)', margin: '10px 0 0', maxWidth: 360, lineHeight: 1.6 }}>
              Fill in the form and I'll take it from here
            </p>
          </motion.div>
        </div>

        <div className="user-form-pane">
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: easeOutExpo }}
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            {renderFormSide()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SubmitFormPage;
