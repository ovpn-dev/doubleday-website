'use client';

import { KeyRound } from 'lucide-react';
import { useState, useTransition } from 'react';
import { createClientPortalLogin } from './actions';

export function ClientLoginForm({
  organizationId,
  leadId,
  existingEmails,
}: {
  organizationId: string;
  leadId: string;
  existingEmails: string[];
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const response = await createClientPortalLogin(organizationId, leadId, email, password);
      if (response.ok) {
        setResult({ ok: true, message: `Login ready for ${response.email}. Share the password with them directly — it isn't stored anywhere retrievable.` });
        setEmail('');
        setPassword('');
      } else {
        setResult({ ok: false, message: response.error });
      }
    });
  }

  return (
    <div className="mt-4 border-t border-green-200 pt-4">
      {existingEmails.length > 0 && (
        <p className="mb-3 text-sm text-green-800">
          Existing portal login{existingEmails.length > 1 ? 's' : ''}: {existingEmails.join(', ')}
        </p>
      )}
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <label className="text-sm font-semibold text-green-900">
          Client email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 block w-56 rounded-lg border border-green-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none ring-blue-800 focus:ring-2"
            placeholder="client@company.com"
          />
        </label>
        <label className="text-sm font-semibold text-green-900">
          Set a password
          <input
            type="text"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 block w-48 rounded-lg border border-green-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none ring-blue-800 focus:ring-2"
            placeholder="8+ characters"
          />
        </label>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center rounded-lg bg-green-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <KeyRound className="mr-2" size={16} /> {isPending ? 'Creating…' : existingEmails.length > 0 ? 'Add / reset login' : 'Create portal login'}
        </button>
      </form>
      {result && (
        <p className={`mt-3 text-sm font-medium ${result.ok ? 'text-green-800' : 'text-red-700'}`} role={result.ok ? undefined : 'alert'}>
          {result.message}
        </p>
      )}
    </div>
  );
}
