import { Outlet } from 'react-router-dom';
import AdminShell from '../../components/AdminLayout/AdminLayout';

export default function AdminLayout() {
  return <AdminShell><Outlet /></AdminShell>;
}
