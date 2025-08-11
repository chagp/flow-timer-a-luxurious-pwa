import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/src/integrations/supabase/client';
import { useAuth } from '@/src/context/AuthContext';
import { DEFAULT_SETTINGS } from '@/constants';
import type { Settings, Theme } from '@/types';

type UserSettingsRow = { user_id: string; theme: Theme; settings: Settings };

export function useUserSettings() {
  const { session } = useAuth();
  const userId = session.user?.id;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['user_settings', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_settings')
        .select('user_id, theme, settings')
        .eq('user_id', userId!)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        // Lazy create default row
        const defaults: UserSettingsRow = { user_id: userId!, theme: 'dark', settings: DEFAULT_SETTINGS };
        const { error: upsertErr } = await supabase.from('user_settings').upsert(defaults);
        if (upsertErr) throw upsertErr;
        return defaults;
      }
      return data as UserSettingsRow;
    },
    initialData: { user_id: userId ?? '', theme: 'dark' as Theme, settings: DEFAULT_SETTINGS },
  });

  // Realtime: invalidate on any change to this user's settings
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`user:${userId}:settings`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_settings',
        filter: `user_id=eq.${userId}`,
      }, () => queryClient.invalidateQueries({ queryKey: ['user_settings', userId] }))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, queryClient]);

  const saveTheme = useMutation({
    mutationFn: async (theme: Theme) => {
      const { error } = await supabase.from('user_settings').upsert({ user_id: userId, theme });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user_settings', userId] }),
  });

  const saveSettings = useMutation({
    mutationFn: async (settings: Settings) => {
      const { error } = await supabase.from('user_settings').upsert({ user_id: userId, settings });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user_settings', userId] }),
  });

  return {
    settings: query.data!.settings,
    theme: query.data!.theme,
    isLoading: query.isPending,
    setTheme: (t: Theme) => saveTheme.mutate(t),
    setSettings: (s: Settings) => saveSettings.mutate(s),
  };
}


