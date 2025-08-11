import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext';

export default function SignUp() {
  const { signUp, refreshSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    setLoading(true);
    const result = await signUp(email, password, fullName);
    if ((result as any)?.error) {
      setError((result as any).error?.message ?? 'Could not sign up');
      setLoading(false);
      return;
    }
    await refreshSession();
    navigate('/signin', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 bg-light-card dark:bg-dark-card p-6 rounded-lg border border-light-border dark:border-dark-border">
        <h1 className="text-xl font-semibold text-light-text dark:text-dark-text">Create account</h1>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <div className="space-y-1">
          <label className="block text-sm text-light-text dark:text-dark-text">Full name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-3 rounded-lg border border-light-border dark:border-dark-border bg-white text-light-text placeholder:text-light-text/60"
            placeholder="Optional"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm text-light-text dark:text-dark-text">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg border border-light-border dark:border-dark-border bg-white text-light-text placeholder:text-light-text/60"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm text-light-text dark:text-dark-text">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg border border-light-border dark:border-dark-border bg-white text-light-text placeholder:text-light-text/60"
            required
          />
        </div>
        <button disabled={loading} type="submit" className="w-full py-3 rounded-lg bg-light-accent dark:bg-dark-accent text-white disabled:opacity-50">
          {loading ? 'Creating…' : 'Sign Up'}
        </button>
        <Link
          to="/signin"
          className="block text-center text-sm text-light-text dark:text-dark-text underline decoration-2 underline-offset-4 font-medium"
        >
          Already have an account? Sign in
        </Link>
      </form>
    </div>
  );
}


