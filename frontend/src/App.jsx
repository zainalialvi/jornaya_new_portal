import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PageTransition } from './components/motion';
import PrivateRoute from './components/PrivateRoute';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import LoginPage from './pages/LoginPage';
import CompaniesPage from './pages/admin/CompaniesPage';
import UsersPage from './pages/admin/UsersPage';
import FormBuilderPage from './pages/admin/FormBuilderPage';
import AuditsPage from './pages/admin/AuditsPage';
import SubmitFormPage from './pages/user/SubmitFormPage';
import SubmissionsPage from './pages/supervisor/SubmissionsPage';
import FormViewPage from './pages/supervisor/FormViewPage';

const RoleBasedRedirect = () => {
  const { role, loading } = useAuth();

  if (loading) {
    return <div style={{ color: 'var(--text-dim)', padding: 40 }}>Loading...</div>;
  }

  if (role === 'admin') return <Navigate to="/admin/companies" replace />;
  if (role === 'supervisor') return <Navigate to="/submissions" replace />;
  if (role === 'user') return <Navigate to="/submit" replace />;
  return <Navigate to="/login" replace />;
};

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)', position: 'relative' }}>
      <div className="aurora" style={{ opacity: 0.5 }} />
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 248, paddingTop: 68, position: 'relative', zIndex: 1 }}>
        <TopHeader />
        <main style={{ padding: 32, minHeight: 'calc(100vh - 68px)' }}>
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              {children}
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/admin/companies"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <DashboardLayout><CompaniesPage /></DashboardLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/companies/:id/users"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <DashboardLayout><UsersPage /></DashboardLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/companies/:id/form"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <DashboardLayout><FormBuilderPage /></DashboardLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/audits"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <DashboardLayout><AuditsPage /></DashboardLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/submit"
            element={
              <PrivateRoute allowedRoles={['user']}>
                <SubmitFormPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/submissions"
            element={
              <PrivateRoute allowedRoles={['supervisor', 'admin']}>
                <DashboardLayout><SubmissionsPage /></DashboardLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/form"
            element={
              <PrivateRoute allowedRoles={['supervisor']}>
                <DashboardLayout><FormViewPage /></DashboardLayout>
              </PrivateRoute>
            }
          />

          <Route path="/" element={<RoleBasedRedirect />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
