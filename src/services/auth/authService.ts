import { supabase } from '@/src/integrations/supabase/client';

export const authService = {
  async signUp(email: string, password: string, fullName?: string, firstName?: string, lastName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          first_name: firstName,
          last_name: lastName,
        },
      },
    });
    return { data, error };
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  },

  async signInWithGoogle() {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  },

  async signOut() {
    await supabase.auth.signOut({ scope: 'global' });
  },

  async getSession() {
    return supabase.auth.getSession();
  },

  onAuthStateChange(cb: Parameters<typeof supabase.auth.onAuthStateChange>[0]) {
    return supabase.auth.onAuthStateChange(cb);
  },
};


