'use client';

import type { GapClientStatus } from '@prisma/client';
import { useState, useTransition } from 'react';
import { setGapClientStatus } from './gap-status-actions';

const statusOptions: { value: GapClientStatus; label: string }[] = [
  { value: 'NOT_STARTED', label: 'Not started' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'ACKNOWLEDGED', label: 'Acknowledged' },
];

const activeStyles: Record<GapClientStatus, string> = {
  NOT_STARTED: 'border-slate-400 bg-slate-100 text-slate-800',
  IN_PROGRESS: 'border-blue-700 bg-blue-700 text-white',
  ACKNOWLEDGED: 'border-green-700 bg-green-700 text-white',
};

export function GapStatusSelector({ answerId, initialStatus }: { answerId: string; initialStatus: GapClientStatus }) {
  const [status, setStatus] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleChange(next: GapClientStatus) {
    if (next === status) return;
    const previous = status;
    setStatus(next);
    setError(null);
    startTransition(async () => {
      const result = await setGapClientStatus(answerId, next);
      if (!result.ok) {
        setStatus(previous);
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="inline-flex overflow-hidden rounded-lg border border-slate-300">
        {statusOptions.map((option, index) => (
          <button
            key={option.value}
            type="button"
            disabled={isPending}
            onClick={() => handleChange(option.value)}
            className={`px-2.5 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
              index > 0 ? 'border-l border-slate-300' : ''
            } ${status === option.value ? activeStyles[option.value] : 'bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            {option.label}
          </button>
        ))}
      </div>
      {error && <p className="text-xs font-medium text-red-700">{error}</p>}
    </div>
  );
}
