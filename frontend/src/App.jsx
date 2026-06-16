import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CompleteProfile from './pages/CompleteProfile';
import ProviderProfileView from './pages/ProviderProfileView';
import MarketplaceExplorer from './pages/MarketplaceExplorer';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Header />
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile/complete" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />
            <Route path="/profile/:userId" element={<ProviderProfileView />} />
            <Route path="/marketplace" element={<ProtectedRoute><MarketplaceExplorer /></ProtectedRoute>} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App
