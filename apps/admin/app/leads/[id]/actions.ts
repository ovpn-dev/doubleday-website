'use server';

import { updateOpportunityEstimate, updateOpportunityStage } from '@doubleday/database/crm';
import type { OpportunityStage } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function changeOpportunityStage(opportunityId: string, stage: OpportunityStage, leadId: string) {
  await updateOpportunityStage(opportunityId, stage);
  revalidatePath(`/leads/${leadId}`);
  revalidatePath('/');
}

export async function setOpportunityEstimate(opportunityId: string, estimatedValue: number | null, leadId: string) {
  await updateOpportunityEstimate(opportunityId, estimatedValue);
  revalidatePath(`/leads/${leadId}`);
  revalidatePath('/');
}

// Convenience action for the "Mark as Proposal Sent" button: advances the
// pipeline stage straight to Negotiation, since a proposal having been sent
// is what defines the boundary between those two stages in this pipeline.
export async function markProposalSent(opportunityId: string, leadId: string) {
  await updateOpportunityStage(opportunityId, 'NEGOTIATION');
  revalidatePath(`/leads/${leadId}`);
  revalidatePath('/');
}
