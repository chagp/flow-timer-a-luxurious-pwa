import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext';

export default function Onboarding() {
  const { session } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 bg-light-card dark:bg-dark-card p-6 rounded-lg border border-light-border dark:border-dark-border">
        <h1 className="text-xl font-semibold">Onboarding</h1>
        <p className="text-sm opacity-80">You are authenticated. Complete onboarding in your backend app to set a tenant_id on your profile, or modify this screen to fit your flow.</p>
        <button className="p-2 rounded border" onClick={() => navigate('/')}>Go to App</button>
        <pre className="text-xs opacity-60 overflow-auto">{JSON.stringify(session.profile, null, 2)}</pre>
      </div>
    </div>
  );
}


