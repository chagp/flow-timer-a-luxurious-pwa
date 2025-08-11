import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/src/integrations/supabase/client';

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // With detectSessionInUrl: true + PKCE, Supabase processes the URL.
    // We still call getSession to ensure it's settled then route home.
    const settle = async () => {
      try {
        await supabase.auth.getSession();
      } finally {
        navigate('/', { replace: true, state: { from: location } });
      }
    };
    settle();
  }, [navigate, location]);

  return null;
}


