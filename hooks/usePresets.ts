import { useCallback } from 'react';
import { Settings } from '../types';
import { supabase } from '@/src/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/context/AuthContext';

// Preset represents a named saved configuration
export interface Preset {
  id: string;
  name: string;
  settings: Settings;
}

// usePresets: Supabase-backed presets CRUD with React Query + Realtime invalidation
export const usePresets = () => {
  const { session } = useAuth();
  const userId = session.user?.id;
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['presets', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('timer_presets')
        .select('id, name, config')
        .eq('user_id', userId!)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((r: any) => ({ id: r.id, name: r.name, settings: r.config as Settings })) as Preset[];
    },
    initialData: [] as Preset[],
  });

  const savePreset = useMutation({
    mutationFn: async ({ name, settings }: { name: string; settings: Settings }) => {
      const { error } = await supabase.from('timer_presets').insert({ user_id: userId, name, config: settings });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['presets', userId] }),
  });

  const deletePreset = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('timer_presets').delete().eq('id', id).eq('user_id', userId!);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['presets', userId] }),
  });

  const renamePreset = useMutation({
    mutationFn: async ({ id, newName }: { id: string; newName: string }) => {
      const { error } = await supabase.from('timer_presets').update({ name: newName }).eq('id', id).eq('user_id', userId!);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['presets', userId] }),
  });

  const updatePreset = useMutation({
    mutationFn: async ({ id, settings }: { id: string; settings: Settings }) => {
      const { error } = await supabase.from('timer_presets').update({ config: settings }).eq('id', id).eq('user_id', userId!);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['presets', userId] }),
  });

  return {
    presets: data || [],
    savePreset: (name: string, settings: Settings) => savePreset.mutate({ name, settings }),
    deletePreset: (id: string) => deletePreset.mutate(id),
    renamePreset: (id: string, newName: string) => renamePreset.mutate({ id, newName }),
    updatePreset: (id: string, settings: Settings) => updatePreset.mutate({ id, settings }),
  };
};