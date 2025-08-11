import { useCallback, useEffect, useState } from 'react';
import { authService } from '@/src/services/auth/authService';
import { fetchUserProfile } from '@/src/services/auth/profileService';
import type { AuthContextType, SessionState } from '@/src/services/auth/types';

function mapUserToAuthUser(u: any) {
  if (!u) return null;
  return {
    id: u.id,
    email: u.email ?? null,
    fullName: (u.user_metadata && (u.user_metadata.full_name || u.user_metadata.name)) ?? null,
    firstName: u.user_metadata?.first_name ?? null,
    lastName: u.user_metadata?.last_name ?? null,
  };
}

export function useAuthProvider(): AuthContextType {
  const [session, setSession] = useState<SessionState>({ user: null, profile: null, isLoading: true, isAuthenticated: false });

  const refreshSessionNow = useCallback(async () => {
    const { data } = await authService.getSession();
    const supaSession = data.session;
    if (supaSession?.user) {
      const mapped = mapUserToAuthUser(supaSession.user);
      setSession((prev) => ({ ...prev, user: mapped, isAuthenticated: true }));
      const profile = await fetchUserProfile(supaSession.user.id);
      setSession((prev) => ({ ...prev, profile, isLoading: false }));
    } else {
      setSession({ user: null, profile: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  const refreshSession = useCallback(async () => {
    await refreshSessionNow();
  }, [refreshSessionNow]);

  useEffect(() => {
    const { data: listener } = authService.onAuthStateChange((_event, currentSession) => {
      if (currentSession?.user) {
        setSession((prev) => ({ ...prev, user: mapUserToAuthUser(currentSession.user), isAuthenticated: true }));
        // slight delay to allow supabase to persist session before querying profile
        setTimeout(async () => {
          const profile = await fetchUserProfile(currentSession.user.id);
          setSession((prev) => ({ ...prev, profile, isLoading: false }));
        }, 100);
      } else {
        setSession({ user: null, profile: null, isLoading: false, isAuthenticated: false });
      }
    });

    // initial fetch
    refreshSessionNow();

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [refreshSessionNow]);

  const signUp = useCallback(async (email: string, password: string, fullName?: string, firstName?: string, lastName?: string) => {
    const { error } = await authService.signUp(email, password, fullName, firstName, lastName);
    if (!error) await refreshSessionNow();
    return { error } as any;
  }, [refreshSessionNow]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await authService.signIn(email, password);
    if (!error) await refreshSessionNow();
    return { error } as any;
  }, [refreshSessionNow]);

  const signInWithGoogle = useCallback(async () => {
    await authService.signInWithGoogle();
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setSession({ user: null, profile: null, isLoading: false, isAuthenticated: false });
  }, []);

  return {
    session,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    refreshSession,
  };
}


