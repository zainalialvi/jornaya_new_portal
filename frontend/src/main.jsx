import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider, theme } from 'antd'
import App from './App.jsx'
import './index.css'

const antdTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#6366f1',
    colorBgBase: '#0a0c12',
    colorBgContainer: '#141726',
    colorBgElevated: '#1f2438',
    colorBorder: '#262a3d',
    colorText: '#e8eaf6',
    colorTextSecondary: '#8b8fa8',
    borderRadius: 10,
    fontFamily: "'Inter', sans-serif",
    colorBgLayout: '#0a0c12',
  },
  components: {
    Table: {
      colorBgContainer: 'transparent',
      headerBg: 'rgba(10,12,18,0.6)',
      headerColor: '#8b8fa8',
      rowHoverBg: 'rgba(99,102,241,0.06)',
      borderColor: '#262a3d',
    },
    Modal: {
      contentBg: '#141726',
      headerBg: '#141726',
    },
    Drawer: {
      colorBgElevated: '#141726',
    },
    Input: {
      colorBgContainer: '#1a1e30',
      colorBorder: '#262a3d',
      activeBorderColor: '#6366f1',
      hoverBorderColor: '#6366f1',
      activeShadow: '0 0 0 3px rgba(99,102,241,0.18)',
    },
    Select: {
      colorBgContainer: '#1a1e30',
      colorBgElevated: '#1f2438',
    },
    Button: {
      primaryColor: '#ffffff',
    },
    Card: {
      colorBgContainer: '#141726',
      colorBorderSecondary: '#262a3d',
    },
    DatePicker: {
      colorBgContainer: '#1a1e30',
      colorBgElevated: '#1f2438',
      colorBorder: '#262a3d',
      activeBorderColor: '#6366f1',
      hoverBorderColor: '#6366f1',
    },
    Switch: {
      colorPrimary: '#6366f1',
    },
  },
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider theme={antdTheme}>
      <App />
    </ConfigProvider>
  </React.StrictMode>,
)
