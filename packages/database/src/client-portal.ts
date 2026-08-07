import { prisma } from './client';

export type ClientProjectView = {
  organization: { id: string; name: string };
  project: { id: string; name: string; status: string; startsOn: Date | null; targetDate: Date | null } | null;
  assessment: {
    standardCode: string;
    overallScore: number | null;
    readinessLabel: string | null;
    submittedAt: Date | null;
    gaps: { code: string; title: string; answer: 'yes' | 'partial' | 'no'; highRisk: boolean }[];
    requiredDocumentGaps: string[];
  } | null;
};

type AnswerResponse = {
  answer: 'yes' | 'partial' | 'no';
  code: string;
  title: string;
};

function isAnswerResponse(value: unknown): value is AnswerResponse {
  return !!value && typeof value === 'object' && 'answer' in value;
}

/**
 * Fetches everything the client dashboard shows, scoped strictly to one
 * organization. The caller (the dashboard page) must get organizationId
 * from the verified session — never from user input — since this function
 * does not re-check authorization itself, the same pattern crm.ts uses for
 * the admin side.
 */
export async function getClientProjectView(organizationId: string): Promise<ClientProjectView | null> {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      projects: { orderBy: { createdAt: 'desc' }, take: 1 },
      gapAssessments: {
        where: { status: 'SUBMITTED' },
        orderBy: { submittedAt: 'desc' },
        take: 1,
        include: {
          answers: {
            include: { clause: { select: { code: true, title: true, highRisk: true } } },
            orderBy: { questionKey: 'asc' },
          },
        },
      },
    },
  });

  if (!organization) return null;

  const assessment = organization.gapAssessments[0] ?? null;
  const project = organization.projects[0] ?? null;

  return {
    organization: { id: organization.id, name: organization.name },
    project: project
      ? { id: project.id, name: project.name, status: project.status, startsOn: project.startsOn, targetDate: project.targetDate }
      : null,
    assessment: assessment
      ? {
          standardCode: assessment.standardCode,
          overallScore: assessment.overallScore,
          readinessLabel: assessment.readinessLabel,
          submittedAt: assessment.submittedAt,
          requiredDocumentGaps: assessment.requiredDocumentGaps,
          gaps: assessment.answers
            .map((answer) => {
              const response = isAnswerResponse(answer.response) ? answer.response : null;
              if (!response || response.answer === 'yes') return null;
              return {
                code: answer.clause?.code ?? response.code,
                title: answer.clause?.title ?? response.title,
                answer: response.answer,
                highRisk: answer.clause?.highRisk ?? false,
              };
            })
            .filter((gap): gap is NonNullable<typeof gap> => gap !== null),
        }
      : null,
  };
}
