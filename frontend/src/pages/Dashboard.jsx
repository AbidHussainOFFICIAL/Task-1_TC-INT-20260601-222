import { useAuth } from '../context/AuthContext';
import CustomerDashboard from './CustomerDashboard';
import ProviderDashboard from './ProviderDashboard';
import AdminDashboard from './AdminDashboard';

export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === 'Admin') {
    return <AdminDashboard />;
  }

  if (user?.role === 'Service Provider') {
    return <ProviderDashboard />;
  }

  return <CustomerDashboard />;
}
