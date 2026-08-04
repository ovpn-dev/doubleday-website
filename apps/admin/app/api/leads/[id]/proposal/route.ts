import { getLeadWithAssessment } from '@doubleday/database/crm';
import { Packer } from 'docx';
import { NextResponse } from 'next/server';
import { buildProposalDocument, type ProposalAnswer } from './document';

export const runtime = 'nodejs';

type AnswerResponse = {
  answer: 'yes' | 'partial' | 'no';
  code: string;
  title: string;
};

function isAnswerResponse(value: unknown): value is AnswerResponse {
  return !!value && typeof value === 'object' && 'answer' in value;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await getLeadWithAssessment(id);

  if (!lead) {
    return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
  }

  const assessment = lead.assessments[0];
  if (!assessment) {
    return NextResponse.json({ error: 'This lead has no submitted assessment to build a proposal from.' }, { status: 400 });
  }

  const opportunity = lead.opportunities[0] ?? null;

  const gapAnswers: ProposalAnswer[] = assessment.answers
    .map((answer) => {
      const response = isAnswerResponse(answer.response) ? answer.response : null;
      if (!response) return null;
      return {
        code: answer.clause?.code ?? response.code,
        title: answer.clause?.title ?? response.title,
        answer: response.answer,
      };
    })
    .filter((value): value is ProposalAnswer => value !== null);

  const document = buildProposalDocument({
    companyName: lead.companyName ?? lead.contactName,
    contactName: lead.contactName,
    email: lead.email,
    standardCode: assessment.standardCode,
    overallScore: assessment.overallScore,
    readinessLabel: assessment.readinessLabel,
    highRiskGaps: assessment.highRiskGaps,
    requiredDocumentGaps: assessment.requiredDocumentGaps,
    gapAnswers,
    estimatedValue: opportunity?.estimatedValue ? Number(opportunity.estimatedValue) : null,
    preparedDate: new Date(),
  });

  const buffer = await Packer.toBuffer(document);
  const filename = `${slugify(lead.companyName ?? lead.contactName)}-${slugify(assessment.standardCode)}-proposal.docx`;

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
