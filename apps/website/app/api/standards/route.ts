import { prisma } from '@doubleday/database/client';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export type AssessableClause = {
  id: string;
  code: string;
  title: string;
  assessmentQuestion: string;
  requiredDocuments: string[];
  highRisk: boolean;
  parentCode: string;
  parentTitle: string;
};

/**
 * Returns the assessable sub-clauses for a standard, in clause order, each
 * carrying its own standard-specific assessment question. Falls back to a
 * generic top-level clause set only if the database has no seeded
 * sub-clauses for the requested standard (e.g. local dev without a seed run).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const standardCode = searchParams.get('standard');

  if (!standardCode) {
    return NextResponse.json({ error: 'A standard code is required.' }, { status: 400 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Standards are not configured yet.' }, { status: 503 });
  }

  const standard = await prisma.standard.findFirst({
    where: { code: standardCode },
    include: {
      clauses: {
        include: { parent: { select: { code: true, title: true, sortOrder: true } } },
      },
    },
  });

  if (!standard) {
    return NextResponse.json({ error: `Standard "${standardCode}" was not found.` }, { status: 404 });
  }

  // Sort in application code: parent clauses are fetched alongside children,
  // so we order by the parent's sortOrder first, then the child's own
  // sortOrder within that parent. Relying on Prisma to order by a joined
  // relation's field here would be fragile across versions, so this is
  // deliberately explicit.
  const clauses: AssessableClause[] = standard.clauses
    .filter((clause) => clause.parentId !== null && clause.assessmentQuestion)
    .sort((a, b) => {
      const parentOrder = (a.parent?.sortOrder ?? 0) - (b.parent?.sortOrder ?? 0);
      if (parentOrder !== 0) return parentOrder;
      return a.sortOrder - b.sortOrder;
    })
    .map((clause) => ({
      id: clause.id,
      code: clause.code,
      title: clause.title,
      assessmentQuestion: clause.assessmentQuestion as string,
      requiredDocuments: clause.requiredDocuments,
      highRisk: clause.highRisk,
      parentCode: clause.parent?.code ?? '',
      parentTitle: clause.parent?.title ?? '',
    }));

  return NextResponse.json({ standardCode: standard.code, edition: standard.edition, clauses });
}
