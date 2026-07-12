import { Outlet } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout/AdminLayout';

export default function SuperAdminLayout() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
