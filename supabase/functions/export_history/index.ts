// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

serve(async (req: Request) => {
  try {
    const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: { user } } = await anon.auth.getUser();
    if (!user) return new Response("Unauthorized", { status: 401 });

    const fmt = new URL(req.url).searchParams.get('format') || 'json';
    const { data, error } = await anon
      .from('timer_history')
      .select('started_at, duration_seconds, status, preset, notes')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) return new Response(error.message, { status: 400 });

    if (fmt === 'csv') {
      const rows = [
        ['started_at','duration_seconds','status','preset','notes'],
        ...data.map((r: any) => [r.started_at, r.duration_seconds, r.status, JSON.stringify(r.preset ?? {}), r.notes ?? ''])
      ];
      const csv = rows.map((r) => r.map((c) => `"${String(c).replaceAll('"','""')}"`).join(',')).join('\n');
      return new Response(csv, { status: 200, headers: { 'content-type': 'text/csv' } });
    }
    return new Response(JSON.stringify(data), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (e) {
    return new Response(String(e?.message ?? e), { status: 500 });
  }
});


