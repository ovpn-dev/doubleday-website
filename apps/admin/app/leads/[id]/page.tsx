import { getLeadWithAssessment } from '@doubleday/database/crm';
import { ArrowLeft, Building2, Mail, TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProposalPanel } from './proposal-panel';
import { StageSelector } from './stage-selector';

type AnswerResponse = {
  answer: 'yes' | 'partial' | 'no';
  code: string;
  title: string;
  question: string;
};

function isAnswerResponse(value: unknown): value is AnswerResponse {
  return !!value && typeof value === 'object' && 'answer' in value;
}

const answerStyles: Record<AnswerResponse['answer'], string> = {
  yes: 'bg-green-100 text-green-800',
  partial: 'bg-amber-100 text-amber-800',
  no: 'bg-red-100 text-red-800',
};

const answerLabels: Record<AnswerResponse['answer'], string> = {
  yes: 'In place',
  partial: 'Partly in place',
  no: 'Not yet',
};

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await getLeadWithAssessment(id);

  if (!lead) {
    notFound();
    return null;
  }

  const assessment = lead.assessments[0] ?? null;
  const opportunity = lead.opportunities[0] ?? null;

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-blue-900 hover:text-blue-700">
          <ArrowLeft className="mr-2" size={16} /> All leads
        </Link>

        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-800">{assessment?.standardCode ?? 'No assessment'}</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-950">{lead.companyName ?? lead.contactName}</h1>
            <p className="mt-1 text-slate-600">
              {lead.contactName} · <a href={`mailto:${lead.email}`} className="text-blue-900 hover:underline">{lead.email}</a>
            </p>
          </div>
          {opportunity && (
            <div className="text-right">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Pipeline stage</p>
              <StageSelector opportunityId={opportunity.id} leadId={lead.id} currentStage={opportunity.stage} />
            </div>
          )}
        </div>

        {lead.organization && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-5">
            <Building2 className="mt-0.5 flex-none text-green-700" size={20} />
            <div>
              <p className="font-semibold text-green-900">Client record created</p>
              <p className="mt-1 text-sm text-green-800">
                {lead.organization.name} is now a client organization
                {lead.organization.projects[0] && <> with project &ldquo;{lead.organization.projects[0].name}&rdquo; ({lead.organization.projects[0].status.toLowerCase()})</>}.
              </p>
            </div>
          </div>
        )}

        {!assessment && (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            This lead has no submitted assessment on record.
          </div>
        )}

        {assessment && (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-blue-950 p-6 text-white">
                <p className="text-sm text-blue-200">Readiness score</p>
                <p className="mt-1 text-4xl font-bold">{assessment.overallScore ?? '—'}%</p>
                {assessment.readinessLabel && <p className="mt-1 text-sm text-blue-200">{assessment.readinessLabel}</p>}
              </div>
              <div className="rounded-2xl bg-red-50 p-6 text-red-950">
                <p className="text-sm text-red-800">Priority gaps</p>
                <p className="mt-1 text-4xl font-bold">{assessment.highRiskGaps.length}</p>
              </div>
              <div className="rounded-2xl bg-slate-100 p-6 text-slate-800">
                <p className="text-sm text-slate-600">Submitted</p>
                <p className="mt-1 text-xl font-semibold">
                  {assessment.submittedAt
                    ? new Date(assessment.submittedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                    : '—'}
                </p>
              </div>
            </div>

            {assessment.highRiskGaps.length > 0 && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6">
                <h2 className="flex items-center gap-2 font-bold text-red-900">
                  <TriangleAlert size={18} /> Priority clauses
                </h2>
                <ul className="mt-3 space-y-1 text-sm text-red-900">
                  {assessment.highRiskGaps.map((gap) => (
                    <li key={gap}>{gap}</li>
                  ))}
                </ul>
              </div>
            )}

            {assessment.requiredDocumentGaps.length > 0 && (
              <div className="mt-6 rounded-2xl border border-slate-200 p-6">
                <h2 className="font-bold text-slate-950">Likely required documents</h2>
                <ul className="mt-3 grid gap-1.5 text-sm text-slate-800 sm:grid-cols-2">
                  {assessment.requiredDocumentGaps.map((doc) => (
                    <li key={doc} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-blue-900" /> {doc}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white">
              <h2 className="border-b border-slate-100 px-6 py-4 font-bold text-slate-950">Clause-by-clause answers</h2>
              <div className="divide-y divide-slate-100">
                {assessment.answers.map((answer) => {
                  const response = isAnswerResponse(answer.response) ? answer.response : null;
                  return (
                    <div key={answer.id} className="flex flex-wrap items-start justify-between gap-3 px-6 py-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-blue-900">
                          {answer.clause?.code ?? response?.code} — {answer.clause?.title ?? response?.title}
                        </p>
                        {response?.question && <p className="mt-1 text-sm text-slate-600">{response.question}</p>}
                      </div>
                      {response && (
                        <span className={`flex-none rounded-full px-2.5 py-1 text-xs font-bold ${answerStyles[response.answer]}`}>
                          {answerLabels[response.answer]}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {opportunity && (
              <ProposalPanel
                opportunityId={opportunity.id}
                leadId={lead.id}
                initialEstimatedValue={opportunity.estimatedValue ? Number(opportunity.estimatedValue) : null}
                currentStage={opportunity.stage}
              />
            )}
          </>
        )}

        <div className="mt-8">
          <a
            href={`mailto:${lead.email}`}
            className="inline-flex items-center rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
          >
            <Mail className="mr-2" size={18} /> Email {lead.contactName.split(' ')[0]}
          </a>
        </div>
      </div>
    </main>
  );
}
