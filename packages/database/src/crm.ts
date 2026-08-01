import { prisma } from './client';

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
