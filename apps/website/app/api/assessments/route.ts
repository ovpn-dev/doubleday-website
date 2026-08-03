import { prisma } from '@doubleday/database/client';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type AssessmentAnswer = {
  clauseId: string;
  code: string;
  title: string;
  question: string;
  answer: 'yes' | 'partial' | 'no';
};

type AssessmentSubmission = {
  companyName: string;
  contactName: string;
  email: string;
  standard: string;
  score: number;
  readinessLabel: string;
  requiredDocumentGaps: string[];
  highRiskGaps: string[];
  answers: AssessmentAnswer[];
};

const scoreByAnswer: Record<AssessmentAnswer['answer'], number> = { yes: 100, partial: 50, no: 0 };

function isSubmission(value: unknown): value is AssessmentSubmission {
  if (!value || typeof value !== 'object') return false;
  const submission = value as Partial<AssessmentSubmission>;
  return typeof submission.companyName === 'string'
    && typeof submission.contactName === 'string'
    && typeof submission.email === 'string'
    && typeof submission.standard === 'string'
    && typeof submission.score === 'number'
    && typeof submission.readinessLabel === 'string'
    && Array.isArray(submission.requiredDocumentGaps)
    && Array.isArray(submission.highRiskGaps)
    && Array.isArray(submission.answers)
    && submission.answers.length > 0
    && submission.answers.every((answer) => typeof answer?.clauseId === 'string' && !!answer.answer);
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Assessment submissions are not configured yet.' }, { status: 503 });
  }

  const payload: unknown = await request.json();
  if (!isSubmission(payload) || !payload.email.includes('@')) {
    return NextResponse.json({ error: 'Please provide complete assessment details.' }, { status: 400 });
  }

  const assessment = await prisma.$transaction(async (tx) => {
    const lead = await tx.lead.create({
      data: {
        companyName: payload.companyName.trim(),
        contactName: payload.contactName.trim(),
        email: payload.email.trim().toLowerCase(),
        source: 'website-gap-assessment',
        status: 'QUALIFYING',
        opportunities: {
          create: {
            title: `${payload.standard} gap assessment — ${payload.companyName.trim()}`,
            stage: 'ASSESSMENT',
          },
        },
      },
    });

    return tx.gapAssessment.create({
      data: {
        leadId: lead.id,
        standardCode: payload.standard,
        status: 'SUBMITTED',
        overallScore: payload.score,
        readinessLabel: payload.readinessLabel,
        requiredDocumentGaps: payload.requiredDocumentGaps,
        highRiskGaps: payload.highRiskGaps,
        submittedAt: new Date(),
        answers: {
          create: payload.answers.map((answer) => ({
            clauseId: answer.clauseId,
            questionKey: answer.code,
            response: {
              answer: answer.answer,
              code: answer.code,
              title: answer.title,
              question: answer.question,
            },
            score: scoreByAnswer[answer.answer],
          })),
        },
      },
    });
  });

  return NextResponse.json({ assessmentId: assessment.id }, { status: 201 });
}
