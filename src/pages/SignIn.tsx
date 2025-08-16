import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext';
import A2HSHint from '@/components/A2HSHint';
import { GoogleIcon } from '@/components/icons';

export default function SignIn() {
  const { signIn, signInWithGoogle, session, refreshSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement | null>(null);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [highlight, setHighlight] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    const result = await signIn(email, password);
    if ((result as any)?.error) {
      setError("We couldn't verify those details. Try again.");
      setLoading(false);
      return;
    }
    await refreshSession();
    navigate('/', { replace: true });
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => setFormVisible(true), 40);
    return () => clearTimeout(t);
  }, []);

  // Smooth scroll handler removed with CTA; keep state for potential future use

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg overflow-x-hidden snap-y snap-mandatory">
      {/* Section 1: Private beta (full viewport) */}
      <section className="min-h-[var(--app-height)] flex items-center justify-center p-6 snap-start">
        <div
          className={`w-full max-w-md rounded-2xl border bg-light-card dark:bg-dark-card p-6 shadow-xl border-light-border dark:border-dark-border transition-all duration-500 ${formVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
        >
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-wide text-light-text/70 dark:text-dark-text/70">Private Beta</div>
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">Private access granted.</h2>
            <p className="text-sm text-light-text/80 dark:text-dark-text/80">
              You’re among a hand‑selected group shaping the next evolution of Flow Timer. Enjoy early
              access to Pro capabilities and bespoke updates crafted around your feedback.
            </p>
            {/* CTA removed per request */}
          </div>
        </div>
      </section>

      {/* Section 2: Sign-in (full viewport) */}
      <section ref={sectionRef} className="min-h-[var(--app-height)] flex items-center justify-center p-6 snap-start">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className={`w-full max-w-md space-y-4 bg-light-card dark:bg-dark-card p-6 rounded-2xl border border-light-border dark:border-dark-border shadow-xl transition-all duration-500 ${formVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} ${highlight ? 'ring-2 ring-light-accent/60 dark:ring-dark-accent/60' : ''}`}
        >
        <div className="space-y-1 mb-1">
          <h1 className="text-2xl font-semibold text-light-text dark:text-dark-text">Sign in</h1>
          <p className="text-xs text-light-text/70 dark:text-dark-text/70">Welcome back—let’s get you in.</p>
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <div className="space-y-1">
          <label className="block text-sm text-light-text dark:text-dark-text">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
            className="w-full p-3 rounded-lg border border-light-border dark:border-dark-border bg-transparent focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent transition"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm text-light-text dark:text-dark-text">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full p-3 rounded-lg border border-light-border dark:border-dark-border bg-transparent focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent transition"
            required
          />
        </div>
        <button disabled={loading} type="submit" className="w-full py-3 rounded-lg bg-light-accent dark:bg-dark-accent text-white font-semibold disabled:opacity-50">
          {loading ? 'Signing you in…' : 'Sign In'}
        </button>
        <div className="text-center text-sm text-light-text/70 dark:text-dark-text/70">or continue with</div>
        <button
          type="button"
          onClick={handleGoogle}
          className="w-full py-3 rounded-lg border border-light-border dark:border-dark-border hover:bg-white/5 transition text-light-text dark:text-dark-text flex items-center justify-center gap-2"
        >
          <GoogleIcon className="w-5 h-5" />
          Continue with Google
        </button>
        <Link
          to="/signup"
          className="block text-center text-sm text-light-text dark:text-dark-text underline decoration-2 underline-offset-4 font-medium"
        >
          New here? Create an account
        </Link>
        </form>
      </section>
      <A2HSHint />
    </div>
  );
}


