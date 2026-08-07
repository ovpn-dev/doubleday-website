import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * One-off repair for opportunities marked WON before hydrateWonOpportunity
 * (packages/database/src/crm.ts) started backfilling
 * GapAssessment.organizationId automatically. Finds every Organization
 * that has a Lead, and for each one, sets organizationId on any of that
 * lead's GapAssessment rows that are still null.
 *
 * Safe to run multiple times — only touches rows where organizationId is
 * still null, so a second run reports 0 fixed rather than erroring or
 * double-applying anything.
 */
async function main() {
  const organizations = await prisma.organization.findMany({
    where: { leads: { some: {} } },
    select: { id: true, leads: { select: { id: true } } },
  });

  let assessmentsFixed = 0;
  for (const organization of organizations) {
    const leadIds = organization.leads.map((lead) => lead.id);
    if (leadIds.length === 0) continue;

    const result = await prisma.gapAssessment.updateMany({
      where: { leadId: { in: leadIds }, organizationId: null },
      data: { organizationId: organization.id },
    });
    assessmentsFixed += result.count;
  }

  console.log(
    `Checked ${organizations.length} organization(s), fixed ${assessmentsFixed} assessment(s) missing organizationId.`,
  );
}

main()
  .catch((error) => {
    console.error('Backfill failed:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
