import { prisma } from './client';
import { Prisma, type OpportunityStage } from '@prisma/client';

export type CrmLeadSummary = {
  id: string;
  companyName: string | null;
  contactName: string;
  email: string;
  status: string;
  createdAt: Date;
  latestAssessment: {
    id: string;
    standardCode: string;
    overallScore: number | null;
    readinessLabel: string | null;
    highRiskGaps: string[];
    requiredDocumentGaps: string[];
    submittedAt: Date | null;
  } | null;
  opportunity: {
    id: string;
    title: string;
    stage: string;
  } | null;
};

/**
 * Read model for the consultant CRM. Authorization is intentionally enforced
 * by the calling application, where the active user and organization context
 * are available.
 */
export async function listAssessmentLeads(): Promise<CrmLeadSummary[]> {
  const leads = await prisma.lead.findMany({
    where: { source: 'website-gap-assessment' },
    orderBy: { createdAt: 'desc' },
    include: {
      assessments: {
        where: { status: 'SUBMITTED' },
        orderBy: { submittedAt: 'desc' },
        take: 1,
        select: {
          id: true,
          standardCode: true,
          overallScore: true,
          readinessLabel: true,
          highRiskGaps: true,
          requiredDocumentGaps: true,
          submittedAt: true,
        },
      },
      opportunities: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: {
          id: true,
          title: true,
          stage: true,
        },
      },
    },
  });

  return leads.map((lead) => ({
    id: lead.id,
    companyName: lead.companyName,
    contactName: lead.contactName,
    email: lead.email,
    status: lead.status,
    createdAt: lead.createdAt,
    latestAssessment: lead.assessments[0] ?? null,
    opportunity: lead.opportunities[0] ?? null,
  }));
}

export async function getLeadWithAssessment(leadId: string) {
  return prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      organization: {
        include: {
          projects: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      },
      opportunities: { orderBy: { createdAt: 'desc' } },
      assessments: {
        orderBy: { submittedAt: 'desc' },
        include: {
          answers: {
            include: { clause: { select: { code: true, title: true } } },
            orderBy: { questionKey: 'asc' },
          },
        },
      },
    },
  });
}

export type WonHydrationResult = {
  organization: { id: string; name: string; slug: string };
  project: { id: string; name: string; status: string };
} | null;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'client';
}

/**
 * Ensures a unique Organization.slug by appending a short random suffix on
 * collision. Organization names (company names from leads) are not
 * guaranteed unique, so the base slug alone can't be trusted.
 */
async function uniqueOrganizationSlug(tx: Prisma.TransactionClient, base: string): Promise<string> {
  const existing = await tx.organization.findUnique({ where: { slug: base }, select: { id: true } });
  if (!existing) return base;
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}

/**
 * When a deal is marked WON: create the client Organization (from the
 * lead's company/contact info) and a linked Project in ACTIVE status,
 * backfill organizationId onto the Lead and Opportunity, and advance the
 * Lead to CONVERTED. Idempotent — if the lead already has an organization
 * (e.g. the deal was re-marked WON after being moved back), this is a
 * no-op and returns null rather than creating duplicates.
 */
export async function hydrateWonOpportunity(opportunityId: string): Promise<WonHydrationResult> {
  return prisma.$transaction(async (tx) => {
    const opportunity = await tx.opportunity.findUnique({
      where: { id: opportunityId },
      include: { lead: true },
    });

    if (!opportunity) {
      throw new Error('Opportunity not found.');
    }

    if (opportunity.organizationId || opportunity.lead.organizationId) {
      // Already hydrated — don't create duplicate records.
      return null;
    }

    const organizationName = opportunity.lead.companyName ?? opportunity.lead.contactName;
    const baseSlug = slugify(organizationName);
    const slug = await uniqueOrganizationSlug(tx, baseSlug);

    const organization = await tx.organization.create({
      data: {
        name: organizationName,
        slug,
        type: 'CLIENT',
      },
    });

    await tx.lead.update({
      where: { id: opportunity.leadId },
      data: { organizationId: organization.id, status: 'CONVERTED' },
    });

    await tx.opportunity.update({
      where: { id: opportunityId },
      data: { organizationId: organization.id },
    });

    // Backfill onto the lead's assessment(s) too. Assessments are created
    // at submission time (before any Organization exists) and only ever
    // linked via leadId — without this, a query path that looks up
    // assessments by organizationId (e.g. the client dashboard) would find
    // nothing for a won client, even though the assessment data exists.
    await tx.gapAssessment.updateMany({
      where: { leadId: opportunity.leadId },
      data: { organizationId: organization.id },
    });

    const project = await tx.project.create({
      data: {
        organizationId: organization.id,
        opportunityId: opportunity.id,
        name: opportunity.title,
        status: 'ACTIVE',
        startsOn: new Date(),
      },
    });

    return {
      organization: { id: organization.id, name: organization.name, slug: organization.slug },
      project: { id: project.id, name: project.name, status: project.status },
    };
  });
}

export async function updateOpportunityStage(opportunityId: string, stage: OpportunityStage) {
  const opportunity = await prisma.opportunity.update({
    where: { id: opportunityId },
    data: { stage },
  });

  if (stage === 'WON') {
    await hydrateWonOpportunity(opportunityId);
  }

  return opportunity;
}

export async function updateOpportunityEstimate(opportunityId: string, estimatedValue: number | null) {
  return prisma.opportunity.update({
    where: { id: opportunityId },
    data: { estimatedValue },
  });
}
