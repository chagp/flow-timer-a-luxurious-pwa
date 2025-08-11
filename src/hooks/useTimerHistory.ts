import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/src/integrations/supabase/client';
import { useAuth } from '@/src/context/AuthContext';
import type { HistoryEntry } from '@/types';

export function useTimerHistory(pageSize: number = 50) {
  const { session } = useAuth();
  const userId = session.user?.id;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['history', userId, pageSize],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('timer_history')
        .select('id, started_at, duration_seconds, status, preset, notes')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false })
        .limit(pageSize);
      if (error) throw error;
      return (data || []).map((r: any) => ({
        id: r.id,
        date: new Date(r.started_at).toLocaleString(),
        label: r.preset?.label ?? 'SESSION',
        duration: r.duration_seconds,
      })) as HistoryEntry[];
    },
    initialData: [] as HistoryEntry[],
  });

  // Realtime invalidate
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`user:${userId}:history`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'timer_history',
        filter: `user_id=eq.${userId}`,
      }, () => queryClient.invalidateQueries({ queryKey: ['history', userId, pageSize] }))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, pageSize, queryClient]);

  const addSession = useMutation({
    mutationFn: async (payload: {
      started_at: string; // ISO
      duration_seconds: number;
      status: 'completed' | 'cancelled';
      preset?: any;
      notes?: string;
    }) => {
      const { error } = await supabase.functions.invoke('record_session', { body: payload });
      if (error) throw error as any;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['history', userId, pageSize] }),
  });

  const clearHistory = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('timer_history')
        .delete()
        .eq('user_id', userId!);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['history', userId, pageSize] }),
  });

  return {
    history: query.data || [],
    isLoading: query.isPending,
    addSession: addSession.mutate,
    clearHistory: () => clearHistory.mutate(),
  };
}


