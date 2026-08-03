import { listAssessmentLeads } from '@doubleday/database/crm';
import { AlertTriangle, Mail, TriangleAlert } from 'lucide-react';

export const dynamic = 'force-dynamic';

function scoreColor(score: number | null) {
  if (score === null) return 'bg-slate-100 text-slate-600';
  if (score < 45) return 'bg-red-100 text-red-800';
  if (score < 75) return 'bg-amber-100 text-amber-800';
  return 'bg-green-100 text-green-800';
}

export default async function LeadsPage() {
  let leads: Awaited<ReturnType<typeof listAssessmentLeads>> = [];
  let loadError: string | null = null;

  try {
    leads = await listAssessmentLeads();
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Could not load leads from the database.';
  }

  // Lowest readiness score first: these are the prospects with the most
  // obvious gap between where they are and certification, which typically
  // makes for the clearest consulting pitch. Leads with no submitted
  // assessment yet sort last.
  const sorted = [...leads].sort((a, b) => {
    const scoreA = a.latestAssessment?.overallScore ?? Infinity;
    const scoreB = b.latestAssessment?.overallScore ?? Infinity;
    return scoreA - scoreB;
  });

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-800">Doubleday OS — Admin</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">Gap assessment leads</h1>
          <p className="mt-2 text-slate-600">
            Prospects who submitted a website gap assessment, sorted by readiness score (lowest first).
          </p>
        </div>

        {loadError && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900">
            <AlertTriangle className="mt-0.5 flex-none" size={20} />
            <div>
              <p className="font-semibold">Could not load leads</p>
              <p className="mt-1 text-sm">{loadError}</p>
            </div>
          </div>
        )}

        {!loadError && sorted.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
            No gap assessments have been submitted yet.
          </div>
        )}

        {sorted.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Company</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Standard</th>
                  <th className="px-5 py-3">Score</th>
                  <th className="px-5 py-3">Priority gaps</th>
                  <th className="px-5 py-3">Stage</th>
                  <th className="px-5 py-3">Submitted</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sorted.map((lead) => (
                  <tr key={lead.id} className="align-top hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-slate-950">{lead.companyName ?? '—'}</td>
                    <td className="px-5 py-4">
                      <p className="text-slate-800">{lead.contactName}</p>
                      <p className="text-xs text-slate-500">{lead.email}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-700">{lead.latestAssessment?.standardCode ?? '—'}</td>
                    <td className="px-5 py-4">
                      {lead.latestAssessment?.overallScore !== null && lead.latestAssessment?.overallScore !== undefined ? (
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${scoreColor(lead.latestAssessment.overallScore)}`}>
                          {lead.latestAssessment.overallScore}%
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                      {lead.latestAssessment?.readinessLabel && (
                        <p className="mt-1 text-xs text-slate-500">{lead.latestAssessment.readinessLabel}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {lead.latestAssessment?.highRiskGaps.length ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700">
                          <TriangleAlert size={14} /> {lead.latestAssessment.highRiskGaps.length}
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-700">{lead.opportunity?.stage ?? lead.status}</td>
                    <td className="px-5 py-4 text-slate-500">
                      {lead.latestAssessment?.submittedAt
                        ? new Date(lead.latestAssessment.submittedAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <a
                        href={`mailto:${lead.email}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-900 hover:text-blue-700"
                      >
                        <Mail size={14} /> Email
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
