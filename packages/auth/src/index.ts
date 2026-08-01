export const membershipRoles = [
  'PLATFORM_ADMIN',
  'DOUBLEDAY_ADMIN',
  'LEAD_CONSULTANT',
  'CONSULTANT',
  'CLIENT_ADMIN',
  'CLIENT_CONTRIBUTOR',
  'CLIENT_VIEWER',
] as const;

export type MembershipRole = (typeof membershipRoles)[number];

const rolePermissions: Record<MembershipRole, readonly string[]> = {
  PLATFORM_ADMIN: ['platform:manage'],
  DOUBLEDAY_ADMIN: ['organizations:manage', 'crm:manage', 'standards:manage'],
  LEAD_CONSULTANT: ['projects:manage', 'audits:manage', 'documents:manage'],
  CONSULTANT: ['projects:contribute', 'audits:contribute', 'documents:contribute'],
  CLIENT_ADMIN: ['organization:manage', 'projects:read', 'documents:approve'],
  CLIENT_CONTRIBUTOR: ['projects:contribute', 'documents:contribute'],
  CLIENT_VIEWER: ['projects:read', 'documents:read'],
};

export function hasPermission(role: MembershipRole, permission: string) {
  return rolePermissions[role].includes(permission);
}
