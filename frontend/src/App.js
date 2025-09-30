import React from 'react';
import Dashboard from './components/Dashboard/Dashboard';
import AuthPage from './components/AuthPage/AuthPage';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './contexts/UserContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useUser();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 text-white">🤖</div>
          </div>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/auth" />;
};

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/*" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;