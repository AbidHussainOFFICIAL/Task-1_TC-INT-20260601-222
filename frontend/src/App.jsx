import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CompleteProfile from './pages/CompleteProfile';
import ProviderProfileView from './pages/ProviderProfileView';
import MarketplaceExplorer from './pages/MarketplaceExplorer';
import ServiceDetails from './pages/ServiceDetails';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
        <div className="app-shell">
          <Header />
          <Routes>
            <Route path="/" element={<Navigate to="/marketplace" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/marketplace" element={<MarketplaceExplorer />} />
            <Route path="/services/:id" element={<ServiceDetails />} />
            <Route path="/profile/complete" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />
            <Route path="/profile/:userId" element={<ProviderProfileView />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/marketplace" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App
