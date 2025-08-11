import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext';

export default function Header() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-end gap-2 p-2">
      <button
        onClick={async () => {
          await signOut();
          navigate('/auth');
        }}
        className="px-3 py-2 rounded border border-light-border dark:border-dark-border"
      >
        Sign Out
      </button>
    </div>
  );
}


