'use client';
import { useActionState } from 'react';
import Link from 'next/link';
import { registerAction } from '@/lib/auth/actions';

export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerAction, {});

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Kanban Board Game</h1>
          <p className="text-slate-400 mt-2 text-sm">Create your account</p>
        </div>

        <form action={action} className="bg-slate-900 rounded-xl border border-slate-700 p-6 space-y-4">
          {state.error && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg px-3 py-2 text-sm text-red-300">
              {state.error}
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm text-slate-300 mb-1">Username</label>
            <input
              id="username" name="username" type="text" required autoComplete="username"
              minLength={3} maxLength={50}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="coolplayer"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm text-slate-300 mb-1">Email</label>
            <input
              id="email" name="email" type="email" required autoComplete="email"
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-slate-300 mb-1">Password</label>
            <input
              id="password" name="password" type="password" required autoComplete="new-password"
              minLength={8}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="min 8 characters"
            />
          </div>

          <button
            type="submit" disabled={pending}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
          >
            {pending ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-4">
          Have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
