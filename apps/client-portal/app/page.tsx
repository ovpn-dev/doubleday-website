import { getClientProjectView } from '@doubleday/database/client-portal';
import { CheckCircle2, ClipboardList, FileText, TriangleAlert } from 'lucide-react';
import { cookies } from 'next/headers';
import { readSessionToken, SESSION_COOKIE_NAME } from '../lib/session';
import { GapStatusSelector } from './gap-status-selector';

const answerLabels: Record<'partial' | 'no', string> = {
  partial: 'Partly in place',
  no: 'Not yet in place',
};

const answerStyles: Record<'partial' | 'no', string> = {
  partial: 'bg-amber-100 text-amber-800',
  no: 'bg-red-100 text-red-800',
};

export default async function PortalHome() {
  // Middleware already guarantees a valid session reaches this page, but
  // it doesn't pass the session forward — reading the cookie again here is
  // the straightforward way to get organizationId without re-plumbing it
  // through headers. Cheap: it's the same signed-cookie check middleware
  // already did, just re-run once more for this one request.
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = await readSessionToken(token);

  // Middleware should make this unreachable, but fail closed rather than
  // assume — never render another organization's data because of a
  // missing session.
  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <p className="text-slate-600">Your session has expired. Please sign in again.</p>
      </main>
    );
  }

  const view = await getClientProjectView(session.organizationId);

  if (!view) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <p className="text-slate-600">We couldn&apos;t find your organization&apos;s data. Contact Doubleday Expressions for help.</p>
      </main>
    );
  }

  const { organization, project, assessment } = view;
  const highRiskGaps = assessment?.gaps.filter((gap) => gap.highRisk) ?? [];
  const otherGaps = assessment?.gaps.filter((gap) => !gap.highRisk) ?? [];

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-800">{organization.name}</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-950">{project?.name ?? 'Your project'}</h1>
            {project && (
              <p className="mt-1 text-slate-600">
                Status: <span className="font-semibold text-slate-800">{project.status.charAt(0) + project.status.slice(1).toLowerCase()}</span>
                {project.startsOn && (
                  <>
                    {' '}· Started {new Date(project.startsOn).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </>
                )}
                {project.targetDate && (
                  <>
                    {' '}· Target {new Date(project.targetDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </>
                )}
              </p>
            )}
          </div>
          <form action="/api/logout" method="POST">
            <button type="submit" className="text-sm font-semibold text-slate-500 hover:text-slate-800">
              Sign out
            </button>
          </form>
        </div>

        {!assessment && (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            No assessment results on file yet. Contact Doubleday Expressions with any questions.
          </div>
        )}

        {assessment && (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-blue-950 p-6 text-white">
                <p className="text-sm text-blue-200">{assessment.standardCode} readiness</p>
                <p className="mt-1 text-4xl font-bold">{assessment.overallScore ?? '—'}%</p>
                {assessment.readinessLabel && <p className="mt-1 text-sm text-blue-200">{assessment.readinessLabel}</p>}
              </div>
              <div className="rounded-2xl bg-slate-100 p-6 text-slate-800">
                <p className="text-sm text-slate-600">Assessment date</p>
                <p className="mt-1 text-xl font-semibold">
                  {assessment.submittedAt
                    ? new Date(assessment.submittedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                    : '—'}
                </p>
              </div>
            </div>

            {assessment.gaps.length === 0 && (
              <div className="mt-6 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-6 text-green-900">
                <CheckCircle2 size={20} /> No open gaps were identified in your assessment.
              </div>
            )}

            {highRiskGaps.length > 0 && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6">
                <h2 className="flex items-center gap-2 font-bold text-red-900">
                  <TriangleAlert size={18} /> Priority areas
                </h2>
                <p className="mt-1 text-sm text-red-800">These typically have the greatest bearing on certification readiness.</p>
                <ul className="mt-3 space-y-3">
                  {highRiskGaps.map((gap) => (
                    <li key={gap.id} className="flex flex-wrap items-start justify-between gap-3 text-sm text-red-900">
                      <span className="pt-1.5"><span className="font-semibold">{gap.code}</span> — {gap.title}</span>
                      <div className="flex flex-none flex-col items-end gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${answerStyles[gap.answer as 'partial' | 'no']}`}>
                          {answerLabels[gap.answer as 'partial' | 'no']}
                        </span>
                        <GapStatusSelector answerId={gap.id} initialStatus={gap.clientStatus} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {otherGaps.length > 0 && (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="flex items-center gap-2 font-bold text-slate-950">
                  <ClipboardList size={18} /> Other areas to address
                </h2>
                <ul className="mt-3 space-y-3">
                  {otherGaps.map((gap) => (
                    <li key={gap.id} className="flex flex-wrap items-start justify-between gap-3 text-sm text-slate-800">
                      <span className="pt-1.5"><span className="font-semibold">{gap.code}</span> — {gap.title}</span>
                      <div className="flex flex-none flex-col items-end gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${answerStyles[gap.answer as 'partial' | 'no']}`}>
                          {answerLabels[gap.answer as 'partial' | 'no']}
                        </span>
                        <GapStatusSelector answerId={gap.id} initialStatus={gap.clientStatus} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {assessment.requiredDocumentGaps.length > 0 && (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="flex items-center gap-2 font-bold text-slate-950">
                  <FileText size={18} /> Documents you&apos;ll need
                </h2>
                <ul className="mt-3 grid gap-1.5 text-sm text-slate-800 sm:grid-cols-2">
                  {assessment.requiredDocumentGaps.map((doc) => (
                    <li key={doc} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-blue-900" /> {doc}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        <p className="mt-8 text-center text-sm text-slate-500">
          Questions about your project? Contact Doubleday Expressions at doubledayexpressions@gmail.com.
        </p>
      </div>
    </main>
  );
}
