import { useState, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar/Sidebar';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import BackgroundFX from './components/BackgroundFX/BackgroundFX';
import { SkeletonPage } from './components/SkeletonLoader/SkeletonLoader';

/* Lazy-loaded pages */
const Landing = lazy(() => import('./pages/Landing/Landing'));
const Login = lazy(() => import('./pages/Login/Login'));
const Signup = lazy(() => import('./pages/Signup/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const NewScan = lazy(() => import('./pages/NewScan/NewScan'));
const ScanProgressPage = lazy(() => import('./pages/ScanProgress/ScanProgressPage'));
const ScanResults = lazy(() => import('./pages/ScanResults/ScanResults'));
const Reports = lazy(() => import('./pages/Reports/Reports'));
const Vulnerabilities = lazy(() => import('./pages/Vulnerabilities/Vulnerabilities'));
const VulnerabilityDetail = lazy(() => import('./pages/VulnerabilityDetail/VulnerabilityDetail'));
const Settings = lazy(() => import('./pages/Settings/Settings'));
const UsersPage = lazy(() => import('./pages/Users/UsersPage'));
const ScanHistory = lazy(() => import('./pages/ScanHistory/ScanHistory'));
const Notifications = lazy(() => import('./pages/Notifications/Notifications'));
const Help = lazy(() => import('./pages/Help/Help'));

/* ─── Protected layout wrapper ─── */
function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={collapsed}
        onCollapse={() => setCollapsed(c => !c)}
        mobileOpen={mobileOpen}
      />

      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={`app-main${collapsed ? ' sidebar-collapsed' : ''}`}
      >
        <Header
          onToggleSidebar={() => setMobileOpen(o => !o)}
          sidebarOpen={mobileOpen}
        />
        <main className="app-content">
          <Suspense fallback={<SkeletonPage />}>
            {children}
          </Suspense>
        </main>
        <Footer />
      </div>
    </div>
  );
}

/* ─── Auth guard ─── */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <SkeletonPage />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}

/* ─── Root App ─── */
export default function App() {
  return (
    <>
      <BackgroundFX />
      <Routes>
        {/* Public */}
        <Route
          path="/"
          element={
            <Suspense fallback={<SkeletonPage />}>
              <Landing />
            </Suspense>
          }
        />
        <Route
          path="/login"
          element={
            <Suspense fallback={<SkeletonPage />}>
              <Login />
            </Suspense>
          }
        />
        <Route
          path="/signup"
          element={
            <Suspense fallback={<SkeletonPage />}>
              <Signup />
            </Suspense>
          }
        />

        {/* Protected */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/scan/new" element={<ProtectedRoute><NewScan /></ProtectedRoute>} />
        <Route path="/scan/progress" element={<ProtectedRoute><ScanProgressPage /></ProtectedRoute>} />
        <Route path="/scan/results" element={<ProtectedRoute><ScanResults /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/vulnerability" element={<ProtectedRoute><Vulnerabilities /></ProtectedRoute>} />
        <Route path="/vulnerability/:id" element={<ProtectedRoute><VulnerabilityDetail /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><ScanHistory /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
