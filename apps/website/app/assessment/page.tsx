'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardCheck, ShieldCheck, TriangleAlert } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { AssessableClause } from '../api/standards/route';

type ReadinessAnswer = 'yes' | 'partial' | 'no';

const answerValues: Record<ReadinessAnswer, number> = { yes: 100, partial: 50, no: 0 };

const standardOptions = ['ISO 9001', 'ISO 45001', 'ISO 14001'];

export default function AssessmentPage() {
  const [step, setStep] = useState(0);
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [standard, setStandard] = useState(standardOptions[0]);
  const [clauses, setClauses] = useState<AssessableClause[]>([]);
  const [clausesLoading, setClausesLoading] = useState(false);
  const [clausesError, setClausesError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, ReadinessAnswer>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Load the standard-specific question set whenever the selected standard
  // changes. Answers are reset because clause identity (and therefore
  // scoring) is specific to a standard.
  useEffect(() => {
    let cancelled = false;
    setClausesLoading(true);
    setClausesError(null);
    setAnswers({});

    fetch(`/api/standards?standard=${encodeURIComponent(standard)}`)
      .then(async (response) => {
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error ?? 'Could not load assessment questions for this standard.');
        }
        return response.json() as Promise<{ clauses: AssessableClause[] }>;
      })
      .then((data) => {
        if (!cancelled) setClauses(data.clauses);
      })
      .catch((error) => {
        if (!cancelled) setClausesError(error instanceof Error ? error.message : 'Could not load assessment questions.');
      })
      .finally(() => {
        if (!cancelled) setClausesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [standard]);

  // Group sub-clauses under their parent clause, preserving seeded order.
  const groupedClauses = useMemo(() => {
    const groups = new Map<string, { parentCode: string; parentTitle: string; items: AssessableClause[] }>();
    for (const clause of clauses) {
      const key = clause.parentCode;
      if (!groups.has(key)) {
        groups.set(key, { parentCode: clause.parentCode, parentTitle: clause.parentTitle, items: [] });
      }
      groups.get(key)!.items.push(clause);
    }
    return Array.from(groups.values());
  }, [clauses]);

  // Score each top-level clause as the average of its sub-clauses, then
  // average across clauses. This keeps a clause with many sub-clauses (e.g.
  // Operation) from dominating a clause with few (e.g. Leadership) purely
  // because it has more questions.
  const { overallScore, gaps, highRiskGaps, requiredDocumentGaps } = useMemo(() => {
    if (!groupedClauses.length) {
      return { overallScore: 0, gaps: [] as AssessableClause[], highRiskGaps: [] as AssessableClause[], requiredDocumentGaps: [] as string[] };
    }

    const clauseAverages: number[] = [];
    for (const group of groupedClauses) {
      const answered = group.items
        .map((item) => answers[item.id])
        .filter((value): value is ReadinessAnswer => Boolean(value));
      if (!answered.length) continue;
      const avg = answered.reduce((total, value) => total + answerValues[value], 0) / answered.length;
      clauseAverages.push(avg);
    }

    const overall = clauseAverages.length
      ? Math.round(clauseAverages.reduce((total, value) => total + value, 0) / clauseAverages.length)
      : 0;

    const gapClauses = clauses.filter((clause) => {
      const answer = answers[clause.id];
      return answer === 'no' || answer === 'partial';
    });

    const highRisk = gapClauses.filter((clause) => clause.highRisk);

    const documents = Array.from(new Set(gapClauses.flatMap((clause) => clause.requiredDocuments)));

    return { overallScore: overall, gaps: gapClauses, highRiskGaps: highRisk, requiredDocumentGaps: documents };
  }, [answers, clauses, groupedClauses]);

  const unanswered = clauses.length - Object.keys(answers).length;
  const canContinue = companyName.trim() && contactName.trim() && email.trim();
  const canFinish = clauses.length > 0 && unanswered === 0;
  const readinessLabel = overallScore >= 75 ? 'Well positioned' : overallScore >= 45 ? 'Partially prepared' : 'Early-stage readiness';

  function selectAnswer(clauseId: string, answer: ReadinessAnswer) {
    setAnswers((current) => ({ ...current, [clauseId]: answer }));
  }

  async function submitAssessment() {
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          contactName,
          email,
          standard,
          score: overallScore,
          readinessLabel,
          requiredDocumentGaps,
          highRiskGaps: highRiskGaps.map((clause) => `${clause.code} ${clause.title}`),
          answers: clauses.map((clause) => ({
            clauseId: clause.id,
            code: clause.code,
            title: clause.title,
            question: clause.assessmentQuestion,
            answer: answers[clause.id],
          })),
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? 'We could not submit your assessment. Please try again.');
      }

      setIsComplete(true);
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : 'We could not submit your assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isComplete) {
    const subject = encodeURIComponent(`${standard} gap assessment — ${companyName}`);
    const bodyLines = [
      `Company: ${companyName}`,
      `Contact: ${contactName}`,
      `Email: ${email}`,
      `Standard: ${standard}`,
      `Readiness score: ${overallScore}% (${readinessLabel})`,
      `Priority gaps: ${highRiskGaps.length}`,
      `Likely required documents: ${requiredDocumentGaps.join('; ') || 'None outstanding'}`,
    ];
    const body = encodeURIComponent(bodyLines.join('\n'));

    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-xl sm:p-12">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="text-green-700" size={34} />
          </div>
          <p className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-blue-800">{standard} readiness</p>
          <h1 className="mt-3 text-center text-4xl font-bold text-slate-950">{readinessLabel}</h1>
          <p className="mt-3 text-center text-lg text-slate-600">
            {companyName} scored <strong className="text-slate-950">{overallScore}%</strong> across the {clauses.length} assessed sub-clauses.
          </p>

          <div className="my-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-blue-950 p-6 text-white">
              <p className="text-sm text-blue-200">Readiness score</p>
              <p className="mt-1 text-4xl font-bold">{overallScore}%</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-6 text-amber-950">
              <p className="text-sm text-amber-800">Total gaps</p>
              <p className="mt-1 text-4xl font-bold">{gaps.length}</p>
              <p className="mt-1 text-sm">clauses need attention</p>
            </div>
            <div className="rounded-2xl bg-red-50 p-6 text-red-950">
              <p className="text-sm text-red-800">Priority gaps</p>
              <p className="mt-1 text-4xl font-bold">{highRiskGaps.length}</p>
              <p className="mt-1 text-sm">high likelihood of blocking certification</p>
            </div>
          </div>

          {highRiskGaps.length > 0 && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-6">
              <h2 className="flex items-center gap-2 font-bold text-red-900">
                <TriangleAlert size={18} /> Priority clauses to address first
              </h2>
              <ul className="mt-3 space-y-1 text-sm text-red-900">
                {highRiskGaps.map((clause) => (
                  <li key={clause.id}>
                    <span className="font-semibold">{clause.code}</span> — {clause.title}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {requiredDocumentGaps.length > 0 && (
            <div className="mb-6 rounded-2xl border border-slate-200 p-6">
              <h2 className="font-bold text-slate-950">Likely required documents</h2>
              <p className="mt-1 text-sm text-slate-600">Based on your gaps, these are typically the documents an auditor will expect to see.</p>
              <ul className="mt-3 grid gap-1.5 text-sm text-slate-800 sm:grid-cols-2">
                {requiredDocumentGaps.map((doc) => (
                  <li key={doc} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-blue-900" /> {doc}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-950">Next step</h2>
            <p className="mt-2 text-slate-600">Share this result with Doubleday Expressions to begin a detailed gap review and implementation proposal.</p>
            <a
              href={`mailto:doubledayexpressions@gmail.com?subject=${subject}&body=${body}`}
              className="mt-5 inline-flex items-center rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
            >
              Send assessment summary <ArrowRight className="ml-2" size={18} />
            </a>
          </div>

          <Link href="/" className="mt-8 inline-flex items-center text-sm font-semibold text-blue-900 hover:text-blue-700">
            <ArrowLeft className="mr-2" size={16} /> Return to website
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-blue-900 hover:text-blue-700">
          <ArrowLeft className="mr-2" size={16} /> Doubleday Expressions
        </Link>
        <div className="mt-8 rounded-3xl bg-white p-6 shadow-xl sm:p-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-4 inline-flex rounded-xl bg-blue-100 p-3 text-blue-900"><ClipboardCheck size={28} /></div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-800">ISO gap assessment</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Understand your certification readiness.</h1>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">Step {step + 1} of 2</span>
          </div>
          <p className="mt-4 text-slate-600">
            Answer clause-level questions for your target standard. Your result is an initial guide—not a certification decision.
          </p>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-blue-900 transition-all" style={{ width: `${step === 0 ? 50 : 100}%` }} />
          </div>

          {step === 0 ? (
            <div className="mt-8 grid gap-5">
              <label className="grid gap-2 text-sm font-semibold text-slate-800">
                Organization name
                <input value={companyName} onChange={(event) => setCompanyName(event.target.value)} className="rounded-lg border border-slate-300 px-4 py-3 font-normal outline-none ring-blue-800 focus:ring-2" placeholder="Your organization" />
              </label>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-slate-800">
                  Your name
                  <input value={contactName} onChange={(event) => setContactName(event.target.value)} className="rounded-lg border border-slate-300 px-4 py-3 font-normal outline-none ring-blue-800 focus:ring-2" placeholder="Full name" />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-slate-800">
                  Work email
                  <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="rounded-lg border border-slate-300 px-4 py-3 font-normal outline-none ring-blue-800 focus:ring-2" placeholder="you@company.com" />
                </label>
              </div>
              <label className="grid gap-2 text-sm font-semibold text-slate-800">
                Standard
                <select value={standard} onChange={(event) => setStandard(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-4 py-3 font-normal outline-none ring-blue-800 focus:ring-2">
                  {standardOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
              <button
                disabled={!canContinue || clausesLoading || !!clausesError}
                onClick={() => setStep(1)}
                className="mt-2 inline-flex w-fit items-center rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {clausesLoading ? 'Loading questions…' : 'Start assessment'} <ArrowRight className="ml-2" size={18} />
              </button>
              {clausesError && <p role="alert" className="text-sm font-medium text-red-700">{clausesError}</p>}
            </div>
          ) : (
            <div className="mt-8 space-y-6">
              {groupedClauses.map((group) => (
                <div key={group.parentCode}>
                  <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-900">
                    Clause {group.parentCode} — {group.parentTitle}
                  </h2>
                  <div className="space-y-4">
                    {group.items.map((item) => (
                      <fieldset key={item.id} className="rounded-2xl border border-slate-200 p-5">
                        <legend className="px-1 text-sm font-bold text-blue-900">
                          {item.code} — {item.title}
                          {item.highRisk && <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">Priority</span>}
                        </legend>
                        <p className="mt-2 text-slate-800">{item.assessmentQuestion}</p>
                        <div className="mt-4 grid gap-2 sm:grid-cols-3">
                          {(['yes', 'partial', 'no'] as ReadinessAnswer[]).map((answer) => (
                            <button
                              key={answer}
                              onClick={() => selectAnswer(item.id, answer)}
                              className={`rounded-lg border px-3 py-2 text-sm font-semibold capitalize transition ${
                                answers[item.id] === answer ? 'border-blue-900 bg-blue-900 text-white' : 'border-slate-200 text-slate-700 hover:border-blue-500'
                              }`}
                            >
                              {answer === 'yes' ? 'Yes, in place' : answer === 'partial' ? 'Partly in place' : 'Not yet'}
                            </button>
                          ))}
                        </div>
                      </fieldset>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button onClick={() => setStep(0)} className="inline-flex items-center rounded-lg px-4 py-3 font-semibold text-blue-900 hover:bg-blue-50">
                  <ArrowLeft className="mr-2" size={18} /> Back
                </button>
                <button
                  disabled={!canFinish || isSubmitting}
                  onClick={() => void submitAssessment()}
                  className="inline-flex items-center rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <ShieldCheck className="mr-2" size={18} /> {isSubmitting ? 'Submitting…' : 'See readiness result'}
                </button>
              </div>
              {unanswered > 0 && <p className="text-right text-sm text-slate-500">{unanswered} question{unanswered === 1 ? '' : 's'} remaining</p>}
              {submissionError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{submissionError}</p>}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
