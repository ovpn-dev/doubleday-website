import { prisma } from '@doubleday/database/client';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type AssessmentAnswer = {
  clause: string;
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
  answers: AssessmentAnswer[];
};

function isSubmission(value: unknown): value is AssessmentSubmission {
  if (!value || typeof value !== 'object') return false;
  const submission = value as Partial<AssessmentSubmission>;
  return typeof submission.companyName === 'string'
    && typeof submission.contactName === 'string'
    && typeof submission.email === 'string'
    && typeof submission.standard === 'string'
    && typeof submission.score === 'number'
    && Array.isArray(submission.answers)
    && submission.answers.length > 0;
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
    const standard = await tx.standard.findFirst({
      where: { code: payload.standard },
      include: { clauses: { select: { id: true, code: true } } },
    });
    const clauseIdByCode = new Map(standard?.clauses.map((clause) => [clause.code, clause.id]) ?? []);

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
        submittedAt: new Date(),
        answers: {
          create: payload.answers.map((answer) => ({
            clauseId: clauseIdByCode.get(answer.clause.replace('Clause ', '')),
            questionKey: answer.clause,
            response: {
              answer: answer.answer,
              clause: answer.clause,
              question: answer.question,
              title: answer.title,
            },
            score: answer.answer === 'yes' ? 100 : answer.answer === 'partial' ? 50 : 0,
          })),
        },
      },
    });
  });

  return NextResponse.json({ assessmentId: assessment.id }, { status: 201 });
}
