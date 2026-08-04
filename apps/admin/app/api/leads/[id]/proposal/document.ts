import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';

export type ProposalAnswer = {
  code: string;
  title: string;
  answer: 'yes' | 'partial' | 'no';
};

export type ProposalInput = {
  companyName: string;
  contactName: string;
  email: string;
  standardCode: string;
  overallScore: number | null;
  readinessLabel: string | null;
  highRiskGaps: string[];
  requiredDocumentGaps: string[];
  gapAnswers: ProposalAnswer[];
  estimatedValue: number | null;
  preparedDate: Date;
};

const BRAND_NAVY = '1e3a8a';
const LIGHT_GREY = 'f1f5f9';

const cellBorder = { style: BorderStyle.SINGLE, size: 2, color: 'cbd5e1' };
const thinBorders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };

function heading(text: string) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 300, after: 150 } });
}

function subheading(text: string) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } });
}

function body(text: string) {
  return new Paragraph({ children: [new TextRun(text)], spacing: { after: 120 } });
}

function bullet(text: string) {
  return new Paragraph({ text, bullet: { level: 0 }, spacing: { after: 60 } });
}

function estimateTimelineWeeks(gapCount: number, highRiskCount: number): string {
  // A simple, transparent heuristic rather than a black-box estimate: a base
  // engagement plus roughly one additional week per open gap, weighted more
  // heavily for high-risk (certification-blocking) gaps. This is presented
  // as an estimate range, not a commitment.
  const base = 4;
  const weeks = base + gapCount * 0.5 + highRiskCount * 1;
  const low = Math.max(4, Math.round(weeks * 0.85));
  const high = Math.max(low + 2, Math.round(weeks * 1.25));
  return `${low}–${high} weeks`;
}

export function buildProposalDocument(input: ProposalInput): Document {
  const gaps = input.gapAnswers.filter((a) => a.answer !== 'yes');
  const timeline = estimateTimelineWeeks(gaps.length, input.highRiskGaps.length);
  const formattedDate = input.preparedDate.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const scopeRows = gaps.map(
    (gap) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 1800, type: WidthType.DXA },
            borders: thinBorders,
            children: [new Paragraph(gap.code)],
          }),
          new TableCell({
            width: { size: 5400, type: WidthType.DXA },
            borders: thinBorders,
            children: [new Paragraph(gap.title)],
          }),
          new TableCell({
            width: { size: 2200, type: WidthType.DXA },
            borders: thinBorders,
            shading: input.highRiskGaps.some((riskGap) => riskGap.startsWith(gap.code))
              ? { type: ShadingType.CLEAR, fill: 'fee2e2' }
              : undefined,
            children: [
              new Paragraph(
                input.highRiskGaps.some((riskGap) => riskGap.startsWith(gap.code)) ? 'Priority' : 'Standard',
              ),
            ],
          }),
        ],
      }),
  );

  return new Document({
    sections: [
      {
        properties: {
          page: { size: { width: 12240, height: 15840 } },
        },
        children: [
          new Paragraph({
            children: [new TextRun({ text: 'Doubleday Expressions', bold: true, size: 28, color: BRAND_NAVY })],
            spacing: { after: 40 },
          }),
          new Paragraph({
            children: [new TextRun({ text: 'ISO Management Systems Consulting', size: 20, color: '475569' })],
            spacing: { after: 300 },
          }),

          new Paragraph({
            children: [new TextRun({ text: `${input.standardCode} Implementation Proposal`, bold: true, size: 32 })],
            spacing: { after: 100 },
          }),
          body(`Prepared for ${input.companyName} · ${formattedDate}`),

          heading('Readiness summary'),
          body(
            `Based on ${input.contactName}'s responses to Doubleday's ${input.standardCode} gap assessment, ${input.companyName} scored ${input.overallScore ?? 'N/A'}% (${input.readinessLabel ?? 'not yet rated'}) against the standard's core requirements.`,
          ),
          body(
            gaps.length > 0
              ? `${gaps.length} clause area${gaps.length === 1 ? '' : 's'} require attention before certification readiness, including ${input.highRiskGaps.length} priority area${input.highRiskGaps.length === 1 ? '' : 's'} that typically have the greatest bearing on audit outcomes.`
              : 'No significant gaps were identified in the initial assessment.',
          ),

          ...(scopeRows.length > 0
            ? [
                heading('Proposed scope of work'),
                body('The following clause areas form the basis of the proposed engagement:'),
                new Table({
                  width: { size: 9400, type: WidthType.DXA },
                  columnWidths: [1800, 5400, 2200],
                  rows: [
                    new TableRow({
                      tableHeader: true,
                      children: [
                        new TableCell({
                          width: { size: 1800, type: WidthType.DXA },
                          borders: thinBorders,
                          shading: { type: ShadingType.CLEAR, fill: LIGHT_GREY },
                          children: [new Paragraph({ children: [new TextRun({ text: 'Clause', bold: true })] })],
                        }),
                        new TableCell({
                          width: { size: 5400, type: WidthType.DXA },
                          borders: thinBorders,
                          shading: { type: ShadingType.CLEAR, fill: LIGHT_GREY },
                          children: [new Paragraph({ children: [new TextRun({ text: 'Area', bold: true })] })],
                        }),
                        new TableCell({
                          width: { size: 2200, type: WidthType.DXA },
                          borders: thinBorders,
                          shading: { type: ShadingType.CLEAR, fill: LIGHT_GREY },
                          children: [new Paragraph({ children: [new TextRun({ text: 'Priority', bold: true })] })],
                        }),
                      ],
                    }),
                    ...scopeRows,
                  ],
                }),
              ]
            : []),

          ...(input.requiredDocumentGaps.length > 0
            ? [
                subheading('Documentation to be developed'),
                body('The engagement includes development of the following documented information:'),
                ...input.requiredDocumentGaps.map((doc) => bullet(doc)),
              ]
            : []),

          heading('Estimated timeline'),
          body(`Based on the scope above, Doubleday estimates an implementation timeline of ${timeline}, subject to organizational availability and the pace of evidence-gathering.`),

          heading('Investment'),
          body(
            input.estimatedValue
              ? `Estimated engagement investment: ${new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(input.estimatedValue)}. Final pricing will be confirmed after scope review.`
              : 'Investment to be confirmed following scope review with Doubleday Expressions.',
          ),

          heading('Next steps'),
          body('This proposal is an initial outline based on your self-reported assessment. Doubleday Expressions will follow up to confirm scope, timeline, and pricing before work begins.'),

          new Paragraph({
            children: [
              new TextRun({
                text: `Contact: ${input.contactName} · ${input.email}`,
                italics: true,
                color: '64748b',
                size: 18,
              }),
            ],
            alignment: AlignmentType.LEFT,
            spacing: { before: 400 },
          }),
        ],
      },
    ],
  });
}
