import { supabase } from '@/src/integrations/supabase/client';
import type { UserProfile } from './types';

// Fetch the current user's profile from `profiles` table, if present
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    // If your app does not have a backend/table yet, return null
    const { data, error } = await supabase
      .from('profiles')
      .select('id, tenant_id, role')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      // eslint-disable-next-line no-console
      console.warn('fetchUserProfile error:', error);
      return null;
    }

    if (!data) return null;
    return {
      id: data.id,
      tenant_id: (data as any).tenant_id ?? null,
      role: (data as any).role ?? null,
    } satisfies UserProfile;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('fetchUserProfile exception:', e);
    return null;
  }
}


