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
        <h1 className="text-xl font-semibold">Create account</h1>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <div className="space-y-1">
          <label className="block text-sm">Full name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-2 rounded border border-light-border dark:border-dark-border bg-transparent"
            placeholder="Optional"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 rounded border border-light-border dark:border-dark-border bg-transparent"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 rounded border border-light-border dark:border-dark-border bg-transparent"
            required
          />
        </div>
        <button disabled={loading} type="submit" className="w-full p-2 rounded bg-light-accent dark:bg-dark-accent text-white disabled:opacity-50">
          {loading ? 'Creating…' : 'Sign Up'}
        </button>
        <div className="text-center text-sm">
          Already have an account?{' '}
          <Link to="/signin" className="underline">Sign in</Link>
        </div>
      </form>
    </div>
  );
}


