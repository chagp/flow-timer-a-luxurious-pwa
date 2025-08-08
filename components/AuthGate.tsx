import React, { useEffect, useMemo, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface AuthGateProps {
  supabaseUrl: string;
  supabaseAnonKey: string;
  onAuthenticated: (client: SupabaseClient) => void;
}

const AuthGate: React.FC<AuthGateProps> = ({ supabaseUrl, supabaseAnonKey, onAuthenticated }) => {
  const supabase = useMemo(() => createClient(supabaseUrl, supabaseAnonKey), [supabaseUrl, supabaseAnonKey]);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp' | 'waiting'>('email');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) onAuthenticated(supabase);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) onAuthenticated(supabase);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase, onAuthenticated]);

  const sendLink = async () => {
    setError(null); setMessage(null);
    if (!email) { setError('Enter your email'); return; }
    setStep('waiting');
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.href } });
    if (error) { setError(error.message); setStep('email'); return; }
    setMessage('Check your email for a login link. You can also enter the 6‑digit code below.');
    setStep('otp');
  };

  const verifyOtp = async () => {
    setError(null);
    if (!email || !otp) { setError('Enter the code'); return; }
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-light-card dark:bg-dark-card rounded-2xl shadow-xl p-6 space-y-4 text-light-text dark:text-dark-text">
        <div className="text-2xl font-bold">Sign In</div>
        <p className="text-sm text-light-text/70 dark:text-dark-text/70">Invite-only access. Use your email to receive a magic link or code.</p>
        <div className="space-y-3">
          <label className="text-sm">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent outline-none"
            placeholder="you@example.com"
          />
          <button onClick={sendLink} className="w-full px-4 py-2 rounded-lg bg-light-accent dark:bg-dark-accent text-white hover:bg-light-accent-hover dark:hover:bg-dark-accent-hover">Send Link</button>
        </div>
        {step === 'otp' && (
          <div className="space-y-3">
            <label className="text-sm">6‑digit code</label>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full px-3 py-2 rounded-lg bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent outline-none tracking-widest text-center font-mono"
              placeholder="••••••"
            />
            <button onClick={verifyOtp} className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border hover:bg-light-subtle-bg dark:hover:bg-dark-subtle-bg">Verify Code</button>
          </div>
        )}
        {message && <div className="text-xs text-light-text/70 dark:text-dark-text/70">{message}</div>}
        {error && <div className="text-xs text-red-500">{error}</div>}
      </div>
    </div>
  );
};

export default AuthGate;


