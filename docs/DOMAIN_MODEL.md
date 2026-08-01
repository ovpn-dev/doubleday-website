# Doubleday OS — Core Domain Model

## Tenant boundary

`Organization` is the primary tenant boundary. Every client-owned record belongs to one organization, and access is granted through a membership with a role.

```text
Organization
├── Sites
├── Memberships → Users / Roles
├── Standards / Standard engagements
├── Leads and Opportunities
├── Projects
├── Documents → Revisions → Approvals / Acknowledgements
├── Audits → Checklists → Evidence → Findings
├── CAPAs → Actions → Verifications
├── Risks
├── Employees → Training assignments → Certificates
├── Assets → Calibration / Maintenance events
└── Certificates
```

## Cross-cutting requirements

- Every auditable workflow records creator, timestamps, state transitions, and relevant approvers.
- Controlled documents never overwrite an approved revision.
- Findings, CAPAs, actions, and evidence must remain traceable after closure.
- A standard engagement links an organization and project to a particular standard and clause set.
- Files are stored outside the application database; metadata and authorization references remain in the database.

## Initial roles

| Role | Responsibility |
| --- | --- |
| Platform administrator | Operates the Doubleday OS platform and standards library. |
| Doubleday administrator | Manages CRM, clients, consultants, and internal operations. |
| Lead consultant | Owns a client engagement and delivery quality. |
| Consultant | Performs assigned project, document, and audit work. |
| Client administrator | Manages the client organization and its user access. |
| Client contributor | Completes assigned actions and submits evidence. |
| Client viewer | Read-only access to approved, permitted information. |
