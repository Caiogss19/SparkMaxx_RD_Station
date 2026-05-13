import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Login } from './pages/Login';

import { Overview } from './pages/Overview';
import { Emails } from './pages/Emails';
import { Workflows } from './pages/Workflows';
import { Assets } from './pages/Assets';
import { SyncLog } from './pages/SyncLog';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/overview" replace />} />
                    <Route path="/overview" element={<Overview />} />
                    <Route path="/emails" element={<Emails />} />
                    <Route path="/workflows" element={<Workflows />} />
                    <Route path="/assets" element={<Assets />} />
                    <Route path="/sync" element={<SyncLog />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
