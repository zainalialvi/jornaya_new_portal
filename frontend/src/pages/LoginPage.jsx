import React, { useState } from 'react';
import { Form, Input, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { easeOutExpo } from '../components/motion';
import Fillo from '../components/Fillo';

const Logo = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <path d="M4 7l8-4 8 4v10l-8 4-8-4V7z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M12 3v18M4 7l8 4 8-4" stroke="white" strokeWidth="1.8" strokeLinejoin="round" opacity="0.85" />
  </svg>
);

const LoginPage = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shy, setShy] = useState(false);
  const [sad, setSad] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // user is re-entering credentials → Fillo cheers back up
  const wake = () => { setSad(false); setError(''); };

  const onFinish = async (values) => {
    setLoading(true);
    setError('');
    try {
      const { role } = await login(values.username, values.password);
      if (role === 'admin') navigate('/admin/companies');
      else if (role === 'supervisor') navigate('/submissions');
      else if (role === 'user') navigate('/submit');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
      setSad(true);
    } finally {
      setLoading(false);
    }
  };

  const field = (delay) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: easeOutExpo, delay },
  });

  return (
    <div className="login-split" style={{ background: 'var(--bg-base)', position: 'relative', overflow: 'hidden' }}>
      <div className="aurora" />
      <div className="grid-overlay" />

      {/* LEFT — robot mascot */}
      <div className="login-bot-pane">
        <Fillo shy={shy} sad={sad} />
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easeOutExpo, delay: 0.3 }}
          style={{ textAlign: 'center', marginTop: 28, zIndex: 1, padding: '0 24px' }}
        >
          <h2 style={{ fontSize: 26, fontWeight: 800, margin: 0 }} className="gradient-text">
            Hi, I'm Fillo 👋
          </h2>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', margin: '8px 0 0' }}>
            Your form-filling bot
          </p>
          <p style={{ fontSize: 14, color: 'var(--text-dim)', margin: '10px 0 0', maxWidth: 380, lineHeight: 1.6 }}>
            I process every submission for you quietly, accurately, and around the clock,
            so nothing slips through
          </p>
        </motion.div>
      </div>

      {/* RIGHT — login form */}
      <div className="login-form-pane">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: easeOutExpo }}
          className="glass"
          style={{
            width: 400, borderRadius: 20, padding: '44px 40px',
            position: 'relative', zIndex: 1,
            boxShadow: '0 30px 70px -20px rgba(0,0,0,0.6)',
            borderTop: '1px solid rgba(99,102,241,0.4)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 30 }}>
            <motion.div
              initial={{ rotate: -12, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.15 }}
              whileHover={{ rotate: 6, scale: 1.06 }}
              style={{
                width: 52, height: 52, background: 'var(--grad-accent)', borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 18, boxShadow: '0 10px 28px -6px var(--accent-glow)',
              }}
            >
              <Logo />
            </motion.div>
            <motion.h1 {...field(0.28)} style={{ fontSize: 25, fontWeight: 700, color: 'var(--text)', margin: 0, textAlign: 'center' }}>
              Welcome back
            </motion.h1>
            <motion.p {...field(0.36)} style={{ fontSize: 14, color: 'var(--text-dim)', margin: '8px 0 0', textAlign: 'center' }}>
              Sign in to your <span className="gradient-text" style={{ fontWeight: 600 }}>Jornaya Portal</span>
            </motion.p>
          </div>

          <Form onFinish={onFinish} layout="vertical" requiredMark={false}>
            <motion.div {...field(0.44)}>
              <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true, message: 'Please enter your username' }]}
                style={{ marginBottom: 20 }}
              >
                <Input size="large" placeholder="Enter your username" style={{ height: 46 }}
                onFocus={() => { setShy(false); wake(); }} onChange={wake} />
              </Form.Item>
            </motion.div>
            <motion.div {...field(0.52)}>
              <Form.Item
                name="password"
                label="Password"
                rules={[{ required: true, message: 'Please enter your password' }]}
                style={{ marginBottom: 24 }}
              >
                <Input.Password
                  size="large"
                  placeholder="Enter your password"
                  style={{ height: 46 }}
                  onFocus={() => { setShy(true); wake(); }}
                  onChange={wake}
                  onBlur={() => setShy(false)}
                />
              </Form.Item>
            </motion.div>
            <motion.div {...field(0.6)}>
              <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" htmlType="submit" loading={loading} block
                  style={{ height: 46, fontSize: 15, fontWeight: 600, borderRadius: 10 }}>
                  Sign In
                </Button>
              </Form.Item>
            </motion.div>
          </Form>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
              style={{
                padding: '10px 14px', background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10,
                color: '#f87171', fontSize: 14, overflow: 'hidden',
              }}
            >
              {error}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
