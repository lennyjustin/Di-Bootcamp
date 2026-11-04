export const permissionCatalog = {
  'dashboard.read': 'View the detailed dashboard',
  'portfolio.summary': 'View aggregate-only portfolio summaries',
  'members.read': 'List and search member records',
  'members.profile.read': 'View full member profiles and financial history',
  'members.manage': 'Create members, manage status, and provision portal access',
  'applications.manage': 'Review membership applications and private documents',
  'savings.read': 'View savings accounts and balances',
  'savings.post': 'Post savings deposits and withdrawals',
  'loans.read': 'View loan applications and records',
  'loans.apply': 'Submit loan applications',
  'loans.analytics': 'View loan portfolio analytics',
  'loans.review': 'Approve or reject loan applications',
  'loans.disburse': 'Disburse approved loans',
  'loans.repay': 'Record loan repayments',
  'guarantees.review': 'Review member guarantee requests',
  'shares.read': 'View recorded share holdings',
  'shares.report': 'View aggregate share reports',
  'transactions.read': 'View transaction ledger entries',
  'reports.read': 'View and export operational reports',
  'payments.read': 'View mobile payment records',
  'staff.read': 'View staff accounts and role definitions',
  'staff.manage': 'Create staff and change staff roles or status',
  'staff.permissions.manage': 'Set individual staff permission overrides',
  'audit.read': 'View staff activity audit history',
  'health.read': 'View application and database health',
};

const allPermissions = Object.keys(permissionCatalog);

export const roleDefinitions = {
  super_admin: {
    label: 'Super administrator',
    description: 'Highest-trust account with full system, staff, role, and individual permission control.',
    permissions: ['*'],
  },
  admin: {
    label: 'System administrator',
    description: 'Full operational access, including staff provisioning.',
    permissions: ['*'],
  },
  cashier: {
    label: 'Cashier / teller',
    description: 'Member lookup, savings operations, and transaction monitoring.',
    permissions: ['members.read', 'savings.read', 'savings.post', 'transactions.read', 'payments.read'],
  },
  credit_officer: {
    label: 'Credit officer',
    description: 'Member profiles, loan intake, and portfolio review; approvals and disbursements remain restricted.',
    permissions: ['members.read', 'members.profile.read', 'loans.read', 'loans.apply', 'loans.analytics', 'guarantees.review'],
  },
  accountant: {
    label: 'Accountant',
    description: 'Read-only access to operational records, reconciliations, and reports.',
    permissions: ['dashboard.read', 'members.read', 'members.profile.read', 'savings.read', 'loans.read', 'loans.analytics', 'shares.read', 'shares.report', 'transactions.read', 'reports.read', 'payments.read', 'portfolio.summary'],
  },
  board: {
    label: 'Board / credit committee',
    description: 'Read-only aggregate portfolio overview without member-level records.',
    permissions: ['portfolio.summary'],
  },
  auditor: {
    label: 'Internal auditor',
    description: 'Read-only audit history and operational records.',
    permissions: ['members.read', 'members.profile.read', 'savings.read', 'loans.read', 'loans.analytics', 'shares.read', 'shares.report', 'transactions.read', 'reports.read', 'payments.read', 'audit.read', 'portfolio.summary'],
  },
  it_support: {
    label: 'IT support',
    description: 'Read-only staff directory and role matrix; no member or financial record access.',
    permissions: ['staff.read', 'health.read'],
  },
};

export function getRolePermissions(role, overrides = null) {
  if (role === 'super_admin') return allPermissions;
  if (overrides !== null && overrides !== undefined) {
    try {
      const parsed = JSON.parse(overrides);
      if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== 'string')) {
        console.error(`Invalid permission overrides for role ${role}; denying permissions`);
        return [];
      }
      return [...new Set(parsed.filter((permission) => allPermissions.includes(permission)))];
    } catch (error) {
      console.error(`Failed to parse permission overrides for role ${role}`, error);
      return [];
    }
  }
  const permissions = roleDefinitions[role]?.permissions || [];
  return permissions.includes('*') ? allPermissions : permissions;
}

export function roleHasPermission(role, permission, overrides = null) {
  if (role === 'super_admin') return true;
  if (overrides !== null && overrides !== undefined) {
    return getRolePermissions(role, overrides).includes(permission);
  }
  const permissions = roleDefinitions[role]?.permissions || [];
  return permissions.includes('*') || permissions.includes(permission);
}
