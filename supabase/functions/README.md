# Edge Functions to create in Supabase
Create these functions in the Supabase Dashboard (Edge Functions). Use the service role key on the server; verify JWTs from the client.

1) upsert_settings
- Validates `{ theme: 'light'|'dark', settings: json }` and writes to `user_settings` for `auth.uid()`.

2) record_session
- Validates `{ started_at, duration_seconds, status, preset?, notes? }` and inserts into `timer_history` with `user_id = auth.uid()`.

3) export_history
- Streams the caller's `timer_history` as CSV/JSON.

4) migrate_local_state
- Accepts `{ settings, theme, history }`. Upserts settings and bulk inserts history for the caller.

All functions should rate-limit and validate payloads (e.g., with Zod) and reject malformed input.
