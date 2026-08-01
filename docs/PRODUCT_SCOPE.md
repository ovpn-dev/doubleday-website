# Doubleday OS — Product Scope

## Product definition

Doubleday OS is a multi-tenant compliance and management-systems platform for ISO consultants and their client organizations. It digitizes the real consulting workflow from initial enquiry through implementation, certification, and continual improvement.

The public website is one application in the platform. It remains focused on trust, discoverability, training, and qualified lead generation; it is not the operational system.

## Vision

Transform Doubleday Expressions from an ISO consulting company into a technology-enabled compliance company whose consulting delivery is strengthened by software.

## Users

| User | Primary outcomes |
| --- | --- |
| Prospect | Understand services, complete a gap assessment, request a proposal. |
| Client sponsor | See certification readiness, projects, decisions, and upcoming actions. |
| Client employee | Complete assigned actions, training, and document acknowledgements. |
| Consultant | Manage leads, projects, audits, evidence, findings, and deliverables. |
| Administrator | Operate the platform, standards library, users, and organization settings. |

## Scope by phase

### Phase 0 — Marketing website

Polish the current website for SEO, services, projects, training, testimonials, content, and lead capture. The site should direct qualified prospects into a structured assessment rather than an untracked inbox.

### Phase 1 — CRM and gap assessment

Replace spreadsheet-based intake with a traceable lifecycle:

`Lead → Opportunity → Gap Assessment → Proposal → Client → Project`

The gap assessment is the product wedge. It produces a readiness score, clause-by-clause gaps, likely required documents, risks, indicative implementation effort, and a proposal brief for the consultant.

### Phase 2 — Client and consultant portal

Give each organization a secure workspace for projects, sites, employees, actions, project timelines, certification status, documents, training, and audit dates.

### Phase 3 — Document control

Support controlled documents including quality manuals, policies, SOPs, work instructions, forms, and records. Required capabilities: document identifiers, drafts, revision history, approval workflow, acknowledgements, review reminders, change log, and archive.

### Phase 4 — Audits and CAPA

Model the complete audit lifecycle:

`Audit → Checklist → Evidence → Finding → CAPA → Verification → Closure`

### Phase 5 — Operational compliance modules

Add risk registers, training matrices and certificates, equipment/asset registers, calibration, maintenance, legal registers, and expiry reminders.

### Phase 6 — ISO-aware AI

AI is introduced only when the structured data, permissions, documents, and workflows exist. It will assist with SOPs, policies, CAPAs, audit checklists, clause guidance, gap analysis, training material, and organization-scoped document questions.

## Initial standards

Start with ISO 9001, ISO 45001, and ISO 14001. Design the standards model so ISO 27001, ISO 22000, ISO 50001, ISO 22301, and later standards can be added as data and rules rather than product rewrites.

## Product principles

1. Model the consultant's real workflow, not generic SaaS abstractions.
2. Maintain evidence, ownership, approvals, and immutable audit trails where compliance requires them.
3. Enforce organization boundaries and role-based access from the first authenticated feature.
4. Build standard-agnostic core models; standards supply clauses, requirements, and templates.
5. Treat AI as an assistive, permission-aware capability—not a generic chatbot or source of record.

## Explicitly out of scope for v1

- Replacing certification bodies or issuing accredited certificates.
- Autonomous compliance decisions or automatic approval of controlled documents.
- A broad ERP, payroll, accounting, or HRIS.
- Building AI features before the document, audit, and access-control foundations exist.
