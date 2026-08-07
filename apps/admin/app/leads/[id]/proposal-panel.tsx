'use client';

import { FileDown, Send } from 'lucide-react';
import { useState, useTransition } from 'react';
import { markProposalSent, setOpportunityEstimate } from './actions';

export function ProposalPanel({
  opportunityId,
  leadId,
  initialEstimatedValue,
  currentStage,
}: {
  opportunityId: string;
  leadId: string;
  initialEstimatedValue: number | null;
  currentStage: string;
}) {
  const [estimatedValue, setEstimatedValue] = useState(initialEstimatedValue?.toString() ?? '');
  const [isSavingEstimate, startSavingEstimate] = useTransition();
  const [isMarkingSent, startMarkingSent] = useTransition();
  const [sentJustNow, setSentJustNow] = useState(false);

  function saveEstimate() {
    const parsed = estimatedValue.trim() === '' ? null : Number(estimatedValue);
    if (parsed !== null && (Number.isNaN(parsed) || parsed < 0)) return;
    startSavingEstimate(async () => {
      await setOpportunityEstimate(opportunityId, parsed, leadId);
    });
  }

  function handleMarkSent() {
    startMarkingSent(async () => {
      await markProposalSent(opportunityId, leadId);
      setSentJustNow(true);
    });
  }

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="font-bold text-slate-950">Proposal</h2>
      <p className="mt-1 text-sm text-slate-600">
        Generates a Word proposal from this lead&apos;s assessment gaps. Nothing is stored — the document is built fresh each time you download it.
      </p>

      <label className="mt-4 block text-sm font-semibold text-slate-800">
        Estimated engagement value (₦)
        <div className="mt-1 flex gap-2">
          <input
            type="number"
            min={0}
            step={1000}
            value={estimatedValue}
            onChange={(event) => setEstimatedValue(event.target.value)}
            onBlur={saveEstimate}
            placeholder="e.g. 850000"
            className="w-48 rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal outline-none ring-blue-800 focus:ring-2"
          />
          {isSavingEstimate && <span className="self-center text-xs text-slate-400">Saving…</span>}
        </div>
      </label>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <a
          href={`/api/leads/${leadId}/proposal`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          <FileDown className="mr-2" size={16} /> Download proposal (.docx)
        </a>

        {currentStage !== 'NEGOTIATION' && currentStage !== 'WON' && currentStage !== 'LOST' && (
          <button
            onClick={handleMarkSent}
            disabled={isMarkingSent || sentJustNow}
            className="inline-flex items-center rounded-lg border border-blue-900 px-4 py-2.5 text-sm font-semibold text-blue-900 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className="mr-2" size={16} />
            {sentJustNow ? 'Marked as sent' : isMarkingSent ? 'Updating…' : 'Mark as Proposal Sent'}
          </button>
        )}
      </div>
    </div>
  );
}
