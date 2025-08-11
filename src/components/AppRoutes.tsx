import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import App from '@/App';
import Auth from '@/src/pages/Auth';
import SignIn from '@/src/pages/SignIn';
import SignUp from '@/src/pages/SignUp';
import AuthCallback from '@/src/pages/AuthCallback';
// Onboarding removed; go straight into app after sign-in

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/auth" element={<Auth />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected app shell */}
      <Route path="/" element={<ProtectedRoute><App /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}


