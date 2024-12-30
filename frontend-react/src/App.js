// frontend-react/src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './views/Dashboard';
import Login from './views/Login';
import HealthFever from './views/HealthFever';
import HealthDiseases from './views/HealthDiseases';
import HealthReports from './views/HealthReports';
import Management from './views/Management';
import SelectProfile from './views/SelectProfile';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      >
        <Route path="select-profile" element={<SelectProfile />} />
        <Route path="health-fever" element={<HealthFever />} />
        <Route path="health-diseases" element={<HealthDiseases />} />
        <Route path="health-reports" element={<HealthReports />} />
        <Route path="management" element={<Management />} />
      </Route>

      {/* Catch all unmatched routes */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
