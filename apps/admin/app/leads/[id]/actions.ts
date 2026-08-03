'use server';

import { updateOpportunityStage } from '@doubleday/database/crm';
import type { OpportunityStage } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function changeOpportunityStage(opportunityId: string, stage: OpportunityStage, leadId: string) {
  await updateOpportunityStage(opportunityId, stage);
  revalidatePath(`/leads/${leadId}`);
  revalidatePath('/');
}
