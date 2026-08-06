'use client';

import { LockKeyhole } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? 'Login failed.');
      }

      const destination = searchParams.get('from') ?? '/';
      router.replace(destination);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-4 inline-flex rounded-xl bg-blue-100 p-3 text-blue-900">
          <LockKeyhole size={22} />
        </div>
        <h1 className="text-xl font-bold text-slate-950">Doubleday OS</h1>
        <p className="mt-1 text-sm text-slate-600">Sign in to view your project.</p>

        <label className="mt-5 block text-sm font-semibold text-slate-800">
          Email
          <input
            type="email"
            autoFocus
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal outline-none ring-blue-800 focus:ring-2"
          />
        </label>

        <label className="mt-4 block text-sm font-semibold text-slate-800">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal outline-none ring-blue-800 focus:ring-2"
          />
        </label>

        {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting || !email || !password}
          className="mt-5 w-full rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="mt-4 text-center text-xs text-slate-500">
          Don&apos;t have login details? Contact Doubleday Expressions at doubledayexpressions@gmail.com.
        </p>
      </form>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
