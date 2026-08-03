import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Sub-clause definitions per standard.
 *
 * Each top-level clause (4-10, the Annex SL / HLS auditable clauses shared by
 * ISO 9001, ISO 45001, and ISO 14001) is broken into the sub-clauses an
 * auditor actually assesses. Each sub-clause carries:
 *  - assessmentQuestion: a plain-language question specific to that standard
 *  - requiredDocuments: documented information typically expected as evidence
 *  - highRisk: whether a gap here is disproportionately likely to block
 *    certification (used to prioritize findings, not just count them)
 */
const standards = [
  {
    code: 'ISO 9001',
    title: 'Quality management systems — Requirements',
    edition: '2015',
    clauses: [
      {
        code: '4',
        title: 'Context of the organization',
        children: [
          {
            code: '4.1',
            title: 'Understanding the organization and its context',
            assessmentQuestion: 'Have you identified the internal and external issues relevant to your quality management system?',
            requiredDocuments: ['Context analysis / SWOT or PESTLE record'],
          },
          {
            code: '4.2',
            title: 'Interested parties',
            assessmentQuestion: 'Have you identified interested parties (customers, regulators, staff, suppliers) and their relevant requirements?',
            requiredDocuments: ['Interested parties register'],
          },
          {
            code: '4.3',
            title: 'Scope of the QMS',
            assessmentQuestion: 'Do you have a documented scope statement for your quality management system?',
            requiredDocuments: ['QMS scope statement'],
            highRisk: true,
          },
          {
            code: '4.4',
            title: 'QMS and its processes',
            assessmentQuestion: 'Are your key processes identified, sequenced, and understood in terms of inputs, outputs, and interactions?',
            requiredDocuments: ['Process map / turtle diagrams'],
          },
        ],
      },
      {
        code: '5',
        title: 'Leadership',
        children: [
          {
            code: '5.1',
            title: 'Leadership and commitment',
            assessmentQuestion: 'Does top management demonstrate active involvement in the QMS rather than delegating it entirely?',
            requiredDocuments: ['Management review minutes showing leadership participation'],
            highRisk: true,
          },
          {
            code: '5.2',
            title: 'Quality policy',
            assessmentQuestion: 'Is there a documented quality policy that is communicated and understood across the organization?',
            requiredDocuments: ['Quality policy statement'],
          },
          {
            code: '5.3',
            title: 'Roles, responsibilities and authorities',
            assessmentQuestion: 'Are QMS-related roles, responsibilities, and authorities assigned and communicated?',
            requiredDocuments: ['Organization chart with QMS responsibilities'],
          },
        ],
      },
      {
        code: '6',
        title: 'Planning',
        children: [
          {
            code: '6.1',
            title: 'Actions to address risks and opportunities',
            assessmentQuestion: 'Do you maintain a documented risk and opportunity register with planned actions?',
            requiredDocuments: ['Risk and opportunity register'],
            highRisk: true,
          },
          {
            code: '6.2',
            title: 'Quality objectives and planning',
            assessmentQuestion: 'Are measurable quality objectives set, tracked, and reviewed at relevant levels?',
            requiredDocuments: ['Quality objectives and tracking record'],
          },
          {
            code: '6.3',
            title: 'Planning of changes',
            assessmentQuestion: 'Is there a defined process for planning changes to the QMS before they are implemented?',
            requiredDocuments: ['Change management procedure or log'],
          },
        ],
      },
      {
        code: '7',
        title: 'Support',
        children: [
          {
            code: '7.1',
            title: 'Resources',
            assessmentQuestion: 'Are people, infrastructure, and environment resources adequate for the QMS and operations?',
            requiredDocuments: ['Resource / infrastructure records'],
          },
          {
            code: '7.2',
            title: 'Competence',
            assessmentQuestion: 'Are competence requirements defined and records kept for staff performing work affecting quality?',
            requiredDocuments: ['Training matrix', 'Competence records'],
          },
          {
            code: '7.3',
            title: 'Awareness',
            assessmentQuestion: 'Are employees aware of the quality policy, their contribution, and implications of nonconformity?',
            requiredDocuments: ['Awareness training records'],
          },
          {
            code: '7.4',
            title: 'Communication',
            assessmentQuestion: 'Is there a defined approach for internal and external QMS-related communication?',
            requiredDocuments: ['Communication plan'],
          },
          {
            code: '7.5',
            title: 'Documented information',
            assessmentQuestion: 'Do you control document creation, approval, revision, and retention (a document control process)?',
            requiredDocuments: ['Document control procedure', 'Master document list'],
            highRisk: true,
          },
        ],
      },
      {
        code: '8',
        title: 'Operation',
        children: [
          {
            code: '8.1',
            title: 'Operational planning and control',
            assessmentQuestion: 'Are operational processes planned, controlled, and documented to meet product/service requirements?',
            requiredDocuments: ['Operational procedures / work instructions'],
          },
          {
            code: '8.2',
            title: 'Requirements for products and services',
            assessmentQuestion: 'Are customer requirements determined and reviewed before you commit to delivering?',
            requiredDocuments: ['Order / contract review records'],
          },
          {
            code: '8.3',
            title: 'Design and development',
            assessmentQuestion: 'If you design products or services, is there a controlled design and development process?',
            requiredDocuments: ['Design and development records'],
          },
          {
            code: '8.4',
            title: 'Control of externally provided processes, products and services',
            assessmentQuestion: 'Are suppliers and subcontractors evaluated, selected, and monitored?',
            requiredDocuments: ['Approved supplier list', 'Supplier evaluation records'],
          },
          {
            code: '8.5',
            title: 'Production and service provision',
            assessmentQuestion: 'Is production/service delivery carried out under controlled conditions with traceability where required?',
            requiredDocuments: ['Production/service records'],
          },
          {
            code: '8.6',
            title: 'Release of products and services',
            assessmentQuestion: 'Is there verification and sign-off before releasing products or services to the customer?',
            requiredDocuments: ['Release/inspection records'],
          },
          {
            code: '8.7',
            title: 'Control of nonconforming outputs',
            assessmentQuestion: 'Is there a defined process for identifying, segregating, and dispositioning nonconforming outputs?',
            requiredDocuments: ['Nonconforming output procedure/log'],
            highRisk: true,
          },
        ],
      },
      {
        code: '9',
        title: 'Performance evaluation',
        children: [
          {
            code: '9.1',
            title: 'Monitoring, measurement, analysis and evaluation',
            assessmentQuestion: 'Do you monitor customer satisfaction and analyze QMS performance data?',
            requiredDocuments: ['Customer satisfaction data', 'KPI/performance records'],
          },
          {
            code: '9.2',
            title: 'Internal audit',
            assessmentQuestion: 'Do you conduct planned internal audits covering the full QMS at defined intervals?',
            requiredDocuments: ['Internal audit program', 'Internal audit reports'],
            highRisk: true,
          },
          {
            code: '9.3',
            title: 'Management review',
            assessmentQuestion: 'Does top management conduct periodic management reviews covering all required inputs and outputs?',
            requiredDocuments: ['Management review minutes'],
            highRisk: true,
          },
        ],
      },
      {
        code: '10',
        title: 'Improvement',
        children: [
          {
            code: '10.1',
            title: 'General',
            assessmentQuestion: 'Do you actively pursue improvement opportunities beyond just fixing problems?',
            requiredDocuments: ['Improvement initiative log'],
          },
          {
            code: '10.2',
            title: 'Nonconformity and corrective action',
            assessmentQuestion: 'Is there a defined corrective action process that addresses root causes, not just symptoms?',
            requiredDocuments: ['Corrective action / CAPA log'],
            highRisk: true,
          },
          {
            code: '10.3',
            title: 'Continual improvement',
            assessmentQuestion: 'Is the suitability, adequacy, and effectiveness of the QMS continually reviewed and improved?',
            requiredDocuments: ['Continual improvement records'],
          },
        ],
      },
    ],
  },
  {
    code: 'ISO 45001',
    title: 'Occupational health and safety management systems — Requirements',
    edition: '2018',
    clauses: [
      {
        code: '4',
        title: 'Context of the organization',
        children: [
          {
            code: '4.1',
            title: 'Understanding the organization and its context',
            assessmentQuestion: 'Have you identified internal and external OH&S issues affecting your organization?',
            requiredDocuments: ['Context analysis record'],
          },
          {
            code: '4.2',
            title: 'Needs and expectations of workers and interested parties',
            assessmentQuestion: 'Have you identified workers and other interested parties and their OH&S needs and expectations?',
            requiredDocuments: ['Interested parties register'],
          },
          {
            code: '4.3',
            title: 'Scope of the OH&S management system',
            assessmentQuestion: 'Do you have a documented scope statement for your OH&S management system?',
            requiredDocuments: ['OH&S management system scope statement'],
            highRisk: true,
          },
        ],
      },
      {
        code: '5',
        title: 'Leadership and worker participation',
        children: [
          {
            code: '5.1',
            title: 'Leadership and commitment',
            assessmentQuestion: 'Does top management take accountability for the effectiveness of the OH&S management system?',
            requiredDocuments: ['Management review / leadership commitment records'],
            highRisk: true,
          },
          {
            code: '5.2',
            title: 'OH&S policy',
            assessmentQuestion: 'Is there a documented OH&S policy communicated across the organization?',
            requiredDocuments: ['OH&S policy statement'],
          },
          {
            code: '5.4',
            title: 'Consultation and participation of workers',
            assessmentQuestion: 'Are workers consulted and given a mechanism to participate in OH&S decisions (e.g. a safety committee)?',
            requiredDocuments: ['Worker consultation records', 'Safety committee minutes'],
            highRisk: true,
          },
        ],
      },
      {
        code: '6',
        title: 'Planning',
        children: [
          {
            code: '6.1',
            title: 'Hazard identification and risk/opportunity assessment',
            assessmentQuestion: 'Do you maintain a hazard identification and risk assessment register covering routine and non-routine activities?',
            requiredDocuments: ['Hazard identification and risk assessment register'],
            highRisk: true,
          },
          {
            code: '6.1.3',
            title: 'Legal and other requirements',
            assessmentQuestion: 'Do you maintain a legal register of applicable OH&S laws and requirements?',
            requiredDocuments: ['Legal and other requirements register'],
            highRisk: true,
          },
          {
            code: '6.2',
            title: 'OH&S objectives and planning',
            assessmentQuestion: 'Are measurable OH&S objectives set, tracked, and reviewed?',
            requiredDocuments: ['OH&S objectives and tracking record'],
          },
        ],
      },
      {
        code: '7',
        title: 'Support',
        children: [
          {
            code: '7.2',
            title: 'Competence',
            assessmentQuestion: 'Are competence requirements defined for roles with OH&S responsibilities, with records kept?',
            requiredDocuments: ['Training matrix', 'Competence records'],
          },
          {
            code: '7.3',
            title: 'Awareness',
            assessmentQuestion: 'Are workers aware of hazards, risks, and their role in incident prevention?',
            requiredDocuments: ['Awareness / toolbox talk records'],
          },
          {
            code: '7.4',
            title: 'Communication',
            assessmentQuestion: 'Is there a defined process for internal and external OH&S communication?',
            requiredDocuments: ['Communication plan'],
          },
          {
            code: '7.5',
            title: 'Documented information',
            assessmentQuestion: 'Do you control OH&S document creation, approval, revision, and retention?',
            requiredDocuments: ['Document control procedure', 'Master document list'],
            highRisk: true,
          },
        ],
      },
      {
        code: '8',
        title: 'Operation',
        children: [
          {
            code: '8.1',
            title: 'Operational planning and control',
            assessmentQuestion: 'Are operational controls (procedures, PPE, permits-to-work) established for identified hazards?',
            requiredDocuments: ['Operational control procedures', 'Permit-to-work records'],
            highRisk: true,
          },
          {
            code: '8.2',
            title: 'Emergency preparedness and response',
            assessmentQuestion: 'Are emergency response plans established, and are drills conducted and recorded?',
            requiredDocuments: ['Emergency response plan', 'Drill records'],
            highRisk: true,
          },
        ],
      },
      {
        code: '9',
        title: 'Performance evaluation',
        children: [
          {
            code: '9.1',
            title: 'Monitoring, measurement, analysis and performance evaluation',
            assessmentQuestion: 'Do you monitor incident rates, near-misses, and other OH&S performance indicators?',
            requiredDocuments: ['Incident/near-miss log', 'OH&S KPI records'],
            highRisk: true,
          },
          {
            code: '9.2',
            title: 'Internal audit',
            assessmentQuestion: 'Do you conduct planned internal audits covering the full OH&S management system?',
            requiredDocuments: ['Internal audit program', 'Internal audit reports'],
            highRisk: true,
          },
          {
            code: '9.3',
            title: 'Management review',
            assessmentQuestion: 'Does top management conduct periodic management reviews of the OH&S management system?',
            requiredDocuments: ['Management review minutes'],
          },
        ],
      },
      {
        code: '10',
        title: 'Improvement',
        children: [
          {
            code: '10.2',
            title: 'Incident, nonconformity and corrective action',
            assessmentQuestion: 'Is there a defined process for investigating incidents and taking corrective action on root causes?',
            requiredDocuments: ['Incident investigation reports', 'Corrective action log'],
            highRisk: true,
          },
          {
            code: '10.3',
            title: 'Continual improvement',
            assessmentQuestion: 'Is the OH&S management system continually reviewed and improved?',
            requiredDocuments: ['Continual improvement records'],
          },
        ],
      },
    ],
  },
  {
    code: 'ISO 14001',
    title: 'Environmental management systems — Requirements with guidance for use',
    edition: '2015',
    clauses: [
      {
        code: '4',
        title: 'Context of the organization',
        children: [
          {
            code: '4.1',
            title: 'Understanding the organization and its context',
            assessmentQuestion: 'Have you identified environmental conditions and issues relevant to your organization?',
            requiredDocuments: ['Context analysis record'],
          },
          {
            code: '4.2',
            title: 'Needs and expectations of interested parties',
            assessmentQuestion: 'Have you identified interested parties and their environment-related requirements?',
            requiredDocuments: ['Interested parties register'],
          },
          {
            code: '4.3',
            title: 'Scope of the environmental management system',
            assessmentQuestion: 'Do you have a documented scope statement for your environmental management system?',
            requiredDocuments: ['EMS scope statement'],
            highRisk: true,
          },
        ],
      },
      {
        code: '5',
        title: 'Leadership',
        children: [
          {
            code: '5.1',
            title: 'Leadership and commitment',
            assessmentQuestion: 'Does top management demonstrate accountability for the effectiveness of the EMS?',
            requiredDocuments: ['Management review / leadership commitment records'],
            highRisk: true,
          },
          {
            code: '5.2',
            title: 'Environmental policy',
            assessmentQuestion: 'Is there a documented environmental policy communicated across the organization?',
            requiredDocuments: ['Environmental policy statement'],
          },
        ],
      },
      {
        code: '6',
        title: 'Planning',
        children: [
          {
            code: '6.1.2',
            title: 'Environmental aspects and impacts',
            assessmentQuestion: 'Do you maintain a register of environmental aspects and impacts for your activities, products, and services?',
            requiredDocuments: ['Environmental aspects and impacts register'],
            highRisk: true,
          },
          {
            code: '6.1.3',
            title: 'Compliance obligations',
            assessmentQuestion: 'Do you maintain a legal and compliance obligations register (permits, regulations, standards)?',
            requiredDocuments: ['Legal and compliance obligations register'],
            highRisk: true,
          },
          {
            code: '6.2',
            title: 'Environmental objectives and planning',
            assessmentQuestion: 'Are measurable environmental objectives set, tracked, and reviewed?',
            requiredDocuments: ['Environmental objectives and tracking record'],
          },
        ],
      },
      {
        code: '7',
        title: 'Support',
        children: [
          {
            code: '7.2',
            title: 'Competence',
            assessmentQuestion: 'Are competence requirements defined for roles with significant environmental impact, with records kept?',
            requiredDocuments: ['Training matrix', 'Competence records'],
          },
          {
            code: '7.3',
            title: 'Awareness',
            assessmentQuestion: 'Are employees aware of significant environmental aspects and the consequences of nonconformity?',
            requiredDocuments: ['Awareness training records'],
          },
          {
            code: '7.5',
            title: 'Documented information',
            assessmentQuestion: 'Do you control environmental document creation, approval, revision, and retention?',
            requiredDocuments: ['Document control procedure', 'Master document list'],
            highRisk: true,
          },
        ],
      },
      {
        code: '8',
        title: 'Operation',
        children: [
          {
            code: '8.1',
            title: 'Operational planning and control',
            assessmentQuestion: 'Are operational controls established for activities associated with significant environmental aspects?',
            requiredDocuments: ['Operational control procedures'],
            highRisk: true,
          },
          {
            code: '8.2',
            title: 'Emergency preparedness and response',
            assessmentQuestion: 'Are emergency response plans (spills, releases) established, and are drills conducted and recorded?',
            requiredDocuments: ['Emergency response plan', 'Drill records'],
            highRisk: true,
          },
        ],
      },
      {
        code: '9',
        title: 'Performance evaluation',
        children: [
          {
            code: '9.1',
            title: 'Monitoring, measurement, analysis and evaluation',
            assessmentQuestion: 'Do you monitor and measure environmental performance (e.g. waste, emissions, resource use) and compliance status?',
            requiredDocuments: ['Environmental monitoring records', 'Compliance evaluation records'],
            highRisk: true,
          },
          {
            code: '9.2',
            title: 'Internal audit',
            assessmentQuestion: 'Do you conduct planned internal audits covering the full environmental management system?',
            requiredDocuments: ['Internal audit program', 'Internal audit reports'],
            highRisk: true,
          },
          {
            code: '9.3',
            title: 'Management review',
            assessmentQuestion: 'Does top management conduct periodic management reviews of the EMS?',
            requiredDocuments: ['Management review minutes'],
          },
        ],
      },
      {
        code: '10',
        title: 'Improvement',
        children: [
          {
            code: '10.2',
            title: 'Nonconformity and corrective action',
            assessmentQuestion: 'Is there a defined corrective action process for environmental nonconformities that addresses root causes?',
            requiredDocuments: ['Corrective action log'],
            highRisk: true,
          },
          {
            code: '10.3',
            title: 'Continual improvement',
            assessmentQuestion: 'Is the EMS continually reviewed and improved to enhance environmental performance?',
            requiredDocuments: ['Continual improvement records'],
          },
        ],
      },
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

    let topSort = 0;
    for (const topClause of standardData.clauses) {
      const parent = await prisma.standardClause.upsert({
        where: { standardId_code: { standardId: standard.id, code: topClause.code } },
        update: { title: topClause.title, sortOrder: topSort },
        create: {
          standardId: standard.id,
          code: topClause.code,
          title: topClause.title,
          sortOrder: topSort,
        },
      });
      topSort += 1;

      let childSort = 0;
      for (const child of topClause.children ?? []) {
        await prisma.standardClause.upsert({
          where: { standardId_code: { standardId: standard.id, code: child.code } },
          update: {
            title: child.title,
            parentId: parent.id,
            assessmentQuestion: child.assessmentQuestion,
            requiredDocuments: child.requiredDocuments ?? [],
            highRisk: child.highRisk ?? false,
            sortOrder: childSort,
          },
          create: {
            standardId: standard.id,
            parentId: parent.id,
            code: child.code,
            title: child.title,
            assessmentQuestion: child.assessmentQuestion,
            requiredDocuments: child.requiredDocuments ?? [],
            highRisk: child.highRisk ?? false,
            sortOrder: childSort,
          },
        });
        childSort += 1;
      }
    }
  }
}

main()
  .then(() => console.log('Seeded ISO standards, clauses, sub-clauses, and assessment questions.'))
  .finally(() => prisma.$disconnect());
