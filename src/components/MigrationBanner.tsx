import React, { useEffect, useState } from 'react';
import { supabase } from '@/src/integrations/supabase/client';

function detectLegacy(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const ls = window.localStorage;
    const ss = window.sessionStorage;
    const keys = [
      'flow-timer-settings',
      'flow-timer-history',
      'flow-timer-theme',
      'flow-timer-presets',
    ];
    const hasAppKeys = keys.some((k) => !!ls.getItem(k));
    // any Supabase v2 keys
    let hasSb = false;
    for (let i = 0; i < ls.length; i++) {
      const k = ls.key(i);
      if (!k) continue;
      if (k.startsWith('sb-') || k.startsWith('supabase.auth.')) { hasSb = true; break; }
    }
    return hasAppKeys || hasSb || ss.length > 0;
  } catch { return false; }
}

export default function MigrationBanner() {
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setShow(detectLegacy());
  }, []);

  if (!show) return null;

  const migrate = async () => {
    try {
      setBusy(true);
      const payload: any = {};
      try {
        payload.settings = JSON.parse(localStorage.getItem('flow-timer-settings') || 'null');
      } catch {}
      try {
        payload.history = JSON.parse(localStorage.getItem('flow-timer-history') || '[]');
      } catch {}
      payload.theme = localStorage.getItem('flow-timer-theme') || undefined;

      await supabase.functions.invoke('migrate_local_state', { body: payload });

      // cleanup
      try {
        localStorage.removeItem('flow-timer-settings');
        localStorage.removeItem('flow-timer-history');
        localStorage.removeItem('flow-timer-theme');
        localStorage.removeItem('flow-timer-presets');
        // clear sb-* if present
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.startsWith('sb-') || k.startsWith('supabase.auth.'))) keys.push(k);
        }
        keys.forEach((k) => localStorage.removeItem(k));
        sessionStorage.clear();
      } catch {}
      setShow(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed top-4 left-4 right-4 z-50">
      <div className="mx-auto max-w-lg rounded-lg border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card p-4 shadow-xl">
        <div className="text-sm mb-2 font-semibold">Migrate your local data</div>
        <div className="text-xs opacity-80 mb-3">We found timer data saved in this browser. Move it to your account so it’s available on any device.</div>
        <div className="flex items-center gap-2 justify-end">
          <button onClick={() => setShow(false)} className="px-3 py-1.5 rounded border">Not now</button>
          <button onClick={migrate} disabled={busy} className="px-3 py-1.5 rounded bg-light-accent dark:bg-dark-accent text-white disabled:opacity-50">{busy ? 'Migrating…' : 'Migrate now'}</button>
        </div>
      </div>
    </div>
  );
}


