import { useCallback, useEffect, useState, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar/Sidebar';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import BackgroundFX from './components/BackgroundFX/BackgroundFX';
import IntroLoader from './components/IntroLoader/IntroLoader';
import PageTransitionLoader from './components/PageTransitionLoader/PageTransitionLoader';
import { SkeletonPage } from './components/SkeletonLoader/SkeletonLoader';
import { publicRoutes } from './pages/Marketing/marketingContent';

/* Lazy-loaded pages */
const Landing = lazy(() => import('./pages/Landing/Landing'));
const MarketingPage = lazy(() => import('./pages/Marketing/MarketingPage'));
const Login = lazy(() => import('./pages/Login/Login'));
const Signup = lazy(() => import('./pages/Signup/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword/ResetPassword'));
const AuthCallback = lazy(() => import('./pages/AuthCallback/AuthCallback'));
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
const SubscriptionPage = lazy(() => import('./pages/Subscription/SubscriptionPage'));
const AdminPortal = lazy(() => import('./pages/Admin/AdminPortal'));

const INTRO_STORAGE_KEY = 'vulnexus:intro-loader-seen';

function shouldShowIntro() {
  try {
    return window.sessionStorage.getItem(INTRO_STORAGE_KEY) !== 'true';
  } catch {
    return true;
  }
}

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

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <SkeletonPage />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!['admin', 'super_admin'].includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}

/* ─── Root App ─── */
export default function App() {
  const [showIntro, setShowIntro] = useState(shouldShowIntro);

  useEffect(() => {
    document.body.classList.toggle('intro-lock', showIntro);
    return () => document.body.classList.remove('intro-lock');
  }, [showIntro]);

  const completeIntro = useCallback(() => {
    try {
      window.sessionStorage.setItem(INTRO_STORAGE_KEY, 'true');
    } catch {
      // Storage can be unavailable in private or embedded contexts.
    }

    setShowIntro(false);
  }, []);

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
        <Route
          path="/forgot-password"
          element={
            <Suspense fallback={<SkeletonPage />}>
              <ForgotPassword />
            </Suspense>
          }
        />
        <Route
          path="/reset-password"
          element={
            <Suspense fallback={<SkeletonPage />}>
              <ResetPassword />
            </Suspense>
          }
        />
        <Route
          path="/auth/:provider/callback"
          element={
            <Suspense fallback={<SkeletonPage />}>
              <AuthCallback />
            </Suspense>
          }
        />
        {publicRoutes.map(({ path, pageKey }) => (
          <Route
            key={path}
            path={path}
            element={
              <Suspense fallback={<SkeletonPage />}>
                <MarketingPage pageKey={pageKey} />
              </Suspense>
            }
          />
        ))}

        {/* Protected */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/scan/new" element={<ProtectedRoute><NewScan /></ProtectedRoute>} />
        <Route path="/scan/progress" element={<ProtectedRoute><ScanProgressPage /></ProtectedRoute>} />
        <Route path="/scan/progress/:scanId" element={<ProtectedRoute><ScanProgressPage /></ProtectedRoute>} />
        <Route path="/scan/results" element={<ProtectedRoute><ScanResults /></ProtectedRoute>} />
        <Route path="/scan/results/:scanId" element={<ProtectedRoute><ScanResults /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/vulnerability" element={<ProtectedRoute><Vulnerabilities /></ProtectedRoute>} />
        <Route path="/vulnerability/:id" element={<ProtectedRoute><VulnerabilityDetail /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><ScanHistory /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
        <Route path="/pricing" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminPortal /></AdminRoute>} />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <PageTransitionLoader disabled={showIntro} />
      {showIntro && <IntroLoader onComplete={completeIntro} />}
    </>
  );
}
