'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardCheck, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';

type ReadinessAnswer = 'yes' | 'partial' | 'no';

const questions = [
  { clause: 'Clause 4', title: 'Context of the organization', question: 'Have you identified internal and external issues, interested parties, and the scope of your management system?' },
  { clause: 'Clause 5', title: 'Leadership', question: 'Has top management defined and communicated a policy, objectives, and clear responsibilities?' },
  { clause: 'Clause 6', title: 'Planning', question: 'Do you maintain documented risks, opportunities, objectives, and plans to address them?' },
  { clause: 'Clause 7', title: 'Support', question: 'Can you demonstrate competent people, controlled documents, awareness, and effective internal communication?' },
  { clause: 'Clause 8', title: 'Operation', question: 'Are key operational processes planned, documented, measured, and controlled?' },
  { clause: 'Clause 9', title: 'Performance evaluation', question: 'Do you conduct internal audits, management reviews, and measurement of customer or stakeholder satisfaction?' },
  { clause: 'Clause 10', title: 'Improvement', question: 'Do you record nonconformities, take corrective actions, and verify that improvements are effective?' },
];

const answerValues: Record<ReadinessAnswer, number> = { yes: 100, partial: 50, no: 0 };

export default function AssessmentPage() {
  const [step, setStep] = useState(0);
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [standard, setStandard] = useState('ISO 9001');
  const [answers, setAnswers] = useState<Record<number, ReadinessAnswer>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const score = useMemo(() => {
    const responseValues = Object.values(answers).map((answer) => answerValues[answer]);
    if (!responseValues.length) return 0;
    return Math.round(responseValues.reduce((total, value) => total + value, 0) / questions.length);
  }, [answers]);

  const unanswered = questions.length - Object.keys(answers).length;
  const canContinue = companyName.trim() && contactName.trim() && email.trim();
  const canFinish = unanswered === 0;
  const readinessLabel = score >= 75 ? 'Well positioned' : score >= 45 ? 'Partially prepared' : 'Early-stage readiness';
  const gapCount = Object.values(answers).filter((answer) => answer !== 'yes').length;

  function selectAnswer(questionIndex: number, answer: ReadinessAnswer) {
    setAnswers((current) => ({ ...current, [questionIndex]: answer }));
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
          score,
          answers: questions.map((question, index) => ({ ...question, answer: answers[index] })),
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
    const body = encodeURIComponent(`Company: ${companyName}\nContact: ${contactName}\nEmail: ${email}\nStandard: ${standard}\nReadiness score: ${score}%\nGaps identified: ${gapCount}`);

    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-xl sm:p-12">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="text-green-700" size={34} />
          </div>
          <p className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-blue-800">{standard} readiness</p>
          <h1 className="mt-3 text-center text-4xl font-bold text-slate-950">{readinessLabel}</h1>
          <p className="mt-3 text-center text-lg text-slate-600">{companyName} scored <strong className="text-slate-950">{score}%</strong> across the initial management-system questions.</p>

          <div className="my-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-blue-950 p-6 text-white"><p className="text-sm text-blue-200">Readiness score</p><p className="mt-1 text-4xl font-bold">{score}%</p></div>
            <div className="rounded-2xl bg-amber-50 p-6 text-amber-950"><p className="text-sm text-amber-800">Focus areas</p><p className="mt-1 text-4xl font-bold">{gapCount}</p><p className="mt-1 text-sm">clauses need attention</p></div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-950">Next step</h2>
            <p className="mt-2 text-slate-600">Share this result with Doubleday Expressions to begin a detailed gap review and implementation proposal.</p>
            <a href={`mailto:doubledayexpressions@gmail.com?subject=${subject}&body=${body}`} className="mt-5 inline-flex items-center rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white transition hover:bg-blue-800">Send assessment summary <ArrowRight className="ml-2" size={18} /></a>
          </div>

          <Link href="/" className="mt-8 inline-flex items-center text-sm font-semibold text-blue-900 hover:text-blue-700"><ArrowLeft className="mr-2" size={16} /> Return to website</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-blue-900 hover:text-blue-700"><ArrowLeft className="mr-2" size={16} /> Doubleday Expressions</Link>
        <div className="mt-8 rounded-3xl bg-white p-6 shadow-xl sm:p-10">
          <div className="flex items-start justify-between gap-4">
            <div><div className="mb-4 inline-flex rounded-xl bg-blue-100 p-3 text-blue-900"><ClipboardCheck size={28} /></div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-800">ISO gap assessment</p><h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Understand your certification readiness.</h1></div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">Step {step + 1} of 2</span>
          </div>
          <p className="mt-4 text-slate-600">Answer seven high-level questions. Your result is an initial guide—not a certification decision.</p>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-900 transition-all" style={{ width: `${step === 0 ? 50 : 100}%` }} /></div>

          {step === 0 ? (
            <div className="mt-8 grid gap-5">
              <label className="grid gap-2 text-sm font-semibold text-slate-800">Organization name<input value={companyName} onChange={(event) => setCompanyName(event.target.value)} className="rounded-lg border border-slate-300 px-4 py-3 font-normal outline-none ring-blue-800 focus:ring-2" placeholder="Your organization" /></label>
              <div className="grid gap-5 sm:grid-cols-2"><label className="grid gap-2 text-sm font-semibold text-slate-800">Your name<input value={contactName} onChange={(event) => setContactName(event.target.value)} className="rounded-lg border border-slate-300 px-4 py-3 font-normal outline-none ring-blue-800 focus:ring-2" placeholder="Full name" /></label><label className="grid gap-2 text-sm font-semibold text-slate-800">Work email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="rounded-lg border border-slate-300 px-4 py-3 font-normal outline-none ring-blue-800 focus:ring-2" placeholder="you@company.com" /></label></div>
              <label className="grid gap-2 text-sm font-semibold text-slate-800">Standard<select value={standard} onChange={(event) => setStandard(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-4 py-3 font-normal outline-none ring-blue-800 focus:ring-2"><option>ISO 9001</option><option>ISO 45001</option><option>ISO 14001</option></select></label>
              <button disabled={!canContinue} onClick={() => setStep(1)} className="mt-2 inline-flex w-fit items-center rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300">Start assessment <ArrowRight className="ml-2" size={18} /></button>
            </div>
          ) : (
            <div className="mt-8 space-y-5">
              {questions.map((item, index) => <fieldset key={item.clause} className="rounded-2xl border border-slate-200 p-5"><legend className="px-1 text-sm font-bold text-blue-900">{item.clause} — {item.title}</legend><p className="mt-2 text-slate-800">{item.question}</p><div className="mt-4 grid gap-2 sm:grid-cols-3">{(['yes', 'partial', 'no'] as ReadinessAnswer[]).map((answer) => <button key={answer} onClick={() => selectAnswer(index, answer)} className={`rounded-lg border px-3 py-2 text-sm font-semibold capitalize transition ${answers[index] === answer ? 'border-blue-900 bg-blue-900 text-white' : 'border-slate-200 text-slate-700 hover:border-blue-500'}`}>{answer === 'yes' ? 'Yes, in place' : answer === 'partial' ? 'Partly in place' : 'Not yet'}</button>)}</div></fieldset>)}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2"><button onClick={() => setStep(0)} className="inline-flex items-center rounded-lg px-4 py-3 font-semibold text-blue-900 hover:bg-blue-50"><ArrowLeft className="mr-2" size={18} /> Back</button><button disabled={!canFinish || isSubmitting} onClick={() => void submitAssessment()} className="inline-flex items-center rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"><ShieldCheck className="mr-2" size={18} /> {isSubmitting ? 'Submitting…' : 'See readiness result'}</button></div>
              {unanswered > 0 && <p className="text-right text-sm text-slate-500">{unanswered} question{unanswered === 1 ? '' : 's'} remaining</p>}
              {submissionError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{submissionError}</p>}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
