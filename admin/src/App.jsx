import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminLayout from './components/AdminLayout';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import BannedUsersPage from './pages/BannedUsersPage';
import UserDetailPage from './pages/UserDetailPage';
import PlanManagement from './pages/PlanManagement';
import TemplateManagement from './pages/TemplateManagement';
import AIModelManagement from './pages/AIModelManagement';
import GalleryModeration from './pages/GalleryModeration';
import AdminLogsPage from './pages/AdminLogsPage';
import SystemReportsPage from './pages/SystemReportsPage';
import AIUsagePage from './pages/AIUsagePage';
import SystemSettingsPage from './pages/SystemSettingsPage';
import ContactMessagesPage from './pages/ContactMessagesPage';
import CustomRequestsPage from './pages/CustomRequestsPage';
import SupportInboxPage from './pages/SupportInboxPage';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen bg-[#F5F8FF] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#4D96FF] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user || user.role !== 'Super Admin') { // Updated to match seeded role
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<AdminLoginPage />} />

          <Route path="/" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="banned" element={<BannedUsersPage />} />
            <Route path="users/:id" element={<UserDetailPage />} />
            <Route path="plans" element={<PlanManagement />} />
            <Route path="templates" element={<TemplateManagement />} />
            <Route path="models" element={<AIModelManagement />} />
            <Route path="gallery" element={<GalleryModeration />} />
            <Route path="logs" element={<AdminLogsPage />} />
            <Route path="reports" element={<SystemReportsPage />} />
            <Route path="ai-usage" element={<AIUsagePage />} />
            <Route path="settings" element={<SystemSettingsPage />} />
            <Route path="contact" element={<ContactMessagesPage />} />
            <Route path="custom-requests" element={<CustomRequestsPage />} />
            <Route path="support" element={<SupportInboxPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
