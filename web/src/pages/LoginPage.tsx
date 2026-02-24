import { useState } from 'react';
import type { FormEvent } from 'react';

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export default function LoginPage({ onLogin, isLoading, error }: LoginPageProps) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onLogin(username, password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 to-slate-900">
      <div className="w-full max-w-md p-8 bg-slate-900 rounded-lg shadow-2xl border border-slate-800">
        <h1 className="text-3xl font-bold text-center mb-6 text-violet-400">D-Kanban</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-slate-700 bg-slate-800 text-slate-50 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-700 bg-slate-800 text-slate-50 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
              placeholder="Enter password"
            />
          </div>

          {error && <div className="p-3 bg-red-950 border border-red-800 text-red-200 rounded-lg text-sm">{error}</div>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-violet-600 text-white font-medium rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-4">Demo: admin / admin123</p>
      </div>
    </div>
  );
}
