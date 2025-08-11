import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext';

export default function Auth() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (session.isLoading) return;
    if (session.isAuthenticated) {
      navigate('/', { replace: true, state: { from: location } });
    } else {
      navigate('/signin', { replace: true, state: { from: location } });
    }
  }, [session.isLoading, session.isAuthenticated, navigate, location]);

  return null;
}


