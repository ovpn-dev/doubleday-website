import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const standards = [
  {
    code: 'ISO 9001',
    title: 'Quality management systems — Requirements',
    edition: '2015',
    clauses: [
      ['4', 'Context of the organization'],
      ['5', 'Leadership'],
      ['6', 'Planning'],
      ['7', 'Support'],
      ['8', 'Operation'],
      ['9', 'Performance evaluation'],
      ['10', 'Improvement'],
    ],
  },
  {
    code: 'ISO 45001',
    title: 'Occupational health and safety management systems — Requirements',
    edition: '2018',
    clauses: [
      ['4', 'Context of the organization'],
      ['5', 'Leadership and worker participation'],
      ['6', 'Planning'],
      ['7', 'Support'],
      ['8', 'Operation'],
      ['9', 'Performance evaluation'],
      ['10', 'Improvement'],
    ],
  },
  {
    code: 'ISO 14001',
    title: 'Environmental management systems — Requirements with guidance for use',
    edition: '2015',
    clauses: [
      ['4', 'Context of the organization'],
      ['5', 'Leadership'],
      ['6', 'Planning'],
      ['7', 'Support'],
      ['8', 'Operation'],
      ['9', 'Performance evaluation'],
      ['10', 'Improvement'],
    ],
  },
];

async function main() {
  for (const standardData of standards) {
    const standard = await prisma.standard.upsert({
      where: { code_edition: { code: standardData.code, edition: standardData.edition } },
      update: { title: standardData.title },
      create: {
        code: standardData.code,
        title: standardData.title,
        edition: standardData.edition,
      },
    });

    for (const [code, title] of standardData.clauses) {
      await prisma.standardClause.upsert({
        where: { standardId_code: { standardId: standard.id, code } },
        update: { title },
        create: { standardId: standard.id, code, title },
      });
    }
  }
}

main()
  .then(() => console.log('Seeded initial ISO standards and clauses.'))
  .finally(() => prisma.$disconnect());
