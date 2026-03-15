import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import List from './pages/List';
import Details from './pages/Details';
import Analytics from './pages/Analytics';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/list" 
            element={
              <ProtectedRoute>
                <List />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/details/:id" 
            element={
              <ProtectedRoute>
                <Details />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/list" replace />} />
          <Route path="*" element={<Navigate to="/list" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
