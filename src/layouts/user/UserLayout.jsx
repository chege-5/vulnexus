import { Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SkeletonPage } from '../../components/SkeletonLoader/SkeletonLoader';
import UserFooter from './UserFooter';
import UserHeader from './UserHeader';
import UserSidebar from './UserSidebar';

export default function UserLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`app-layout${sidebarOpen ? ' sidebar-open' : ''}`}>
      <UserSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={`app-main${sidebarOpen ? ' sidebar-open' : ''}`}>
        <UserHeader
          onToggleSidebar={() => setSidebarOpen((open) => !open)}
          sidebarOpen={sidebarOpen}
        />
        <main className="app-content">
          <Suspense fallback={<SkeletonPage />}>
            <Outlet />
          </Suspense>
        </main>
        <UserFooter />
      </div>
    </div>
  );
}
