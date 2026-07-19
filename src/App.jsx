import { useCallback, useEffect, useState, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import BackgroundFX from './components/BackgroundFX/BackgroundFX';
import IntroLoader from './components/IntroLoader/IntroLoader';
import PageTransitionLoader from './components/PageTransitionLoader/PageTransitionLoader';
import { SkeletonPage } from './components/SkeletonLoader/SkeletonLoader';
import { publicRoutes } from './pages/Marketing/marketingContent';
import SuperAdminLayout from './layouts/admin/SuperAdminLayout';
import UserLayout from './layouts/user/UserLayout';
import { isAdminUser } from './utils/authRoles';

/* Lazy-loaded pages */
const Landing = lazy(() => import('./pages/Landing/Landing'));
const MarketingPage = lazy(() => import('./pages/Marketing/MarketingPage'));
const Login = lazy(() => import('./pages/Login/Login'));
const Signup = lazy(() => import('./pages/Signup/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword/ResetPassword'));
const VerifyResetCode = lazy(() => import('./pages/ResetPassword/VerifyResetCode'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail/VerifyEmail'));
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

/* ─── Auth guard ─── */
function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <SkeletonPage />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

function AdminRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <SkeletonPage />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdminUser(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

function UserRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <SkeletonPage />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isAdminUser(user)) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}

function LegacyScanRedirect({ type }) {
  const { scanId, id } = useParams();
  const identifier = scanId || id;
  const target = identifier ? `/dashboard/${type}/${identifier}` : `/dashboard/${type}`;
  return <Navigate to={target} replace />;
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
          path="/reset-password/verify"
          element={
            <Suspense fallback={<SkeletonPage />}>
              <VerifyResetCode />
            </Suspense>
          }
        />
        <Route
          path="/verify-email"
          element={
            <Suspense fallback={<SkeletonPage />}>
              <VerifyEmail />
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

        {/* Role-separated authenticated areas */}
        <Route element={<ProtectedRoute />}>
          <Route element={<UserRoute />}>
            <Route path="/dashboard/*" element={<UserLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="scan/new" element={<NewScan />} />
              <Route path="scan/progress" element={<ScanProgressPage />} />
              <Route path="scan/progress/:scanId" element={<ScanProgressPage />} />
              <Route path="scan/results" element={<ScanResults />} />
              <Route path="scan/results/:scanId" element={<ScanResults />} />
              <Route path="scans" element={<ScanHistory />} />
              <Route path="reports" element={<Reports />} />
              <Route path="vulnerabilities" element={<Vulnerabilities />} />
              <Route path="vulnerabilities/:id" element={<VulnerabilityDetail />} />
              <Route path="account" element={<UsersPage />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<Settings />} />
              <Route path="help" element={<Help />} />
              <Route path="billing" element={<SubscriptionPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin/*" element={<SuperAdminLayout />}>
              <Route index element={<AdminPortal />} />
              <Route path="users" element={<AdminPortal />} />
              <Route path="roles" element={<AdminPortal />} />
              <Route path="analytics" element={<AdminPortal />} />
              <Route path="audit-logs" element={<AdminPortal />} />
              <Route path="settings" element={<AdminPortal />} />
              <Route path="notifications" element={<AdminPortal />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>
          </Route>
        </Route>

        {/* Legacy authenticated URLs */}
        <Route path="/scan/new" element={<Navigate to="/dashboard/scan/new" replace />} />
        <Route path="/scan/progress" element={<Navigate to="/dashboard/scan/progress" replace />} />
        <Route path="/scan/progress/:scanId" element={<LegacyScanRedirect type="scan/progress" />} />
        <Route path="/scan/results" element={<Navigate to="/dashboard/scan/results" replace />} />
        <Route path="/scan/results/:scanId" element={<LegacyScanRedirect type="scan/results" />} />
        <Route path="/reports" element={<Navigate to="/dashboard/reports" replace />} />
        <Route path="/vulnerability" element={<Navigate to="/dashboard/vulnerabilities" replace />} />
        <Route path="/vulnerability/:id" element={<LegacyScanRedirect type="vulnerabilities" />} />
        <Route path="/settings" element={<Navigate to="/dashboard/settings" replace />} />
        <Route path="/users" element={<Navigate to="/dashboard/account" replace />} />
        <Route path="/history" element={<Navigate to="/dashboard/scans" replace />} />
        <Route path="/notifications" element={<Navigate to="/dashboard/notifications" replace />} />
        <Route path="/help" element={<Navigate to="/dashboard/help" replace />} />
        <Route path="/pricing" element={<Navigate to="/dashboard/billing" replace />} />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <PageTransitionLoader disabled={showIntro} />
      {showIntro && <IntroLoader onComplete={completeIntro} />}
    </>
  );
}
