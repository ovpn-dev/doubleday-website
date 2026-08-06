'use server';

import { createClientLogin, updateOpportunityEstimate, updateOpportunityStage } from '@doubleday/database/crm';
import { hashPassword } from '@doubleday/auth/password';
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

export type CreateLoginResult = { ok: true; email: string } | { ok: false; error: string };

export async function createClientPortalLogin(
  organizationId: string,
  leadId: string,
  email: string,
  password: string,
): Promise<CreateLoginResult> {
  const trimmedEmail = email.trim();
  if (!trimmedEmail || !trimmedEmail.includes('@')) {
    return { ok: false, error: 'Enter a valid email address.' };
  }
  if (password.length < 8) {
    return { ok: false, error: 'Password must be at least 8 characters.' };
  }

  const passwordHash = await hashPassword(password);
  const result = await createClientLogin(organizationId, trimmedEmail, passwordHash);
  revalidatePath(`/leads/${leadId}`);
  return { ok: true, email: result.email };
}
