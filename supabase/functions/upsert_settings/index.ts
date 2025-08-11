// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  try {
    const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const {
      data: { user },
    } = await anon.auth.getUser();
    if (!user) return new Response("Unauthorized", { status: 401 });

    const body = (await req.json()) as { theme?: string; settings?: any };
    const theme = body.theme === "light" || body.theme === "dark" ? body.theme : undefined;
    const settings = body.settings ?? undefined;

    if (!theme && !settings) return new Response("Bad Request", { status: 400 });

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const payload: any = { user_id: user.id };
    if (theme) payload.theme = theme;
    if (settings) payload.settings = settings;

    const { error } = await admin.from("user_settings").upsert(payload);
    if (error) return new Response(error.message, { status: 400 });

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json" } });
  } catch (e) {
    return new Response(String(e?.message ?? e), { status: 500 });
  }
});


