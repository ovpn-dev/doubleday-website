'use client';

import type { OpportunityStage } from '@prisma/client';
import { useState, useTransition } from 'react';
import { changeOpportunityStage } from './actions';

const stages: OpportunityStage[] = ['DISCOVERY', 'ASSESSMENT', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];

const stageLabels: Record<OpportunityStage, string> = {
  DISCOVERY: 'Discovery',
  ASSESSMENT: 'Assessment',
  PROPOSAL: 'Proposal sent',
  NEGOTIATION: 'Negotiation',
  WON: 'Won',
  LOST: 'Lost',
};

export function StageSelector({
  opportunityId,
  leadId,
  currentStage,
}: {
  opportunityId: string;
  leadId: string;
  currentStage: OpportunityStage;
}) {
  const [stage, setStage] = useState(currentStage);
  const [isPending, startTransition] = useTransition();

  function handleChange(next: OpportunityStage) {
    setStage(next);
    startTransition(async () => {
      await changeOpportunityStage(opportunityId, next, leadId);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={stage}
        disabled={isPending}
        onChange={(event) => handleChange(event.target.value as OpportunityStage)}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none ring-blue-800 focus:ring-2 disabled:opacity-60"
      >
        {stages.map((option) => (
          <option key={option} value={option}>
            {stageLabels[option]}
          </option>
        ))}
      </select>
      {isPending && <span className="text-xs text-slate-400">Saving…</span>}
    </div>
  );
}
