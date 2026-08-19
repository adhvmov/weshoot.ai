/**
 * Main App Component
 * Root application component with routing
 */
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, createContext } from 'react';
import { LandingPage, LoginPage, DashboardPage, EditorPage, VerifyEmailPage, ForgotPasswordPage, ResetPasswordPage, PricingPage, PromptGalleryPage, CustomRequestPage } from './pages';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import ProtectedRoute from './components/ProtectedRoute';
import EarlyAccessModal from './components/modals/EarlyAccessModal';
import useSiteStatus from './hooks/useSiteStatus';

import { AuthProvider } from './context/AuthContext';

// Create context for site status
export const SiteStatusContext = createContext();

function App() {
  const siteStatus = useSiteStatus();
  const [showEarlyAccessModal, setShowEarlyAccessModal] = useState(false);

  return (
    <Router>
      <AuthProvider>
        <SiteStatusContext.Provider value={{ ...siteStatus, showEarlyAccessModal: () => setShowEarlyAccessModal(true) }}>
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Pricing Page */}
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/custom-request" element={<CustomRequestPage />} />

            {/* Legal Pages */}
            <Route path="/terms" element={<TermsOfServicePage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<LoginPage />} /> {/* Route register to Login for now as it handles both */}
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/prompts" element={<PromptGalleryPage />} />
            <Route path="/generate" element={<LandingPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/editor" element={<EditorPage />} />
              {/* <Route path="/history" element={<LandingPage />} /> */}
            </Route>
          </Routes>

          {/* Early Access Modal */}
          <EarlyAccessModal
            isOpen={showEarlyAccessModal}
            onClose={() => setShowEarlyAccessModal(false)}
          />
        </SiteStatusContext.Provider>
      </AuthProvider>
    </Router>
  );
}

export default App;
