// Role-Based Access Control (RBAC) System

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  HR_MANAGER: 'hr_manager',
  FINANCE_MANAGER: 'finance_manager',
  COMPLIANCE_OFFICER: 'compliance_officer',
  SITE_MANAGER: 'site_manager',
  EMPLOYEE: 'employee',
};

export const PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD: 'view_dashboard',
  
  // Workforce
  VIEW_WORKFORCE: 'view_workforce',
  ADD_EMPLOYEE: 'add_employee',
  EDIT_EMPLOYEE: 'edit_employee',
  DELETE_EMPLOYEE: 'delete_employee',
  
  // Partners
  VIEW_PARTNERS: 'view_partners',
  ADD_PARTNER: 'add_partner',
  EDIT_PARTNER: 'edit_partner',
  DELETE_PARTNER: 'delete_partner',
  
  // Payroll
  VIEW_PAYROLL: 'view_payroll',
  ADD_PAYROLL: 'add_payroll',
  EDIT_PAYROLL: 'edit_payroll',
  DELETE_PAYROLL: 'delete_payroll',
  PROCESS_PAYROLL: 'process_payroll',
  
  // Finance
  VIEW_FINANCE: 'view_finance',
  ADD_TRANSACTION: 'add_transaction',
  EDIT_TRANSACTION: 'edit_transaction',
  DELETE_TRANSACTION: 'delete_transaction',
  
  // Compliance
  VIEW_COMPLIANCE: 'view_compliance',
  ADD_COMPLIANCE: 'add_compliance',
  EDIT_COMPLIANCE: 'edit_compliance',
  DELETE_COMPLIANCE: 'delete_compliance',
  
  // AI
  USE_AI: 'use_ai',
  
  // Export
  EXPORT_DATA: 'export_data',
  
  // System
  MANAGE_USERS: 'manage_users',
  MANAGE_ROLES: 'manage_roles',
  VIEW_AUDIT_LOGS: 'view_audit_logs',
};

// Role-Permission mapping
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS), // All permissions
  
  [ROLES.HR_MANAGER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_WORKFORCE,
    PERMISSIONS.ADD_EMPLOYEE,
    PERMISSIONS.EDIT_EMPLOYEE,
    PERMISSIONS.DELETE_EMPLOYEE,
    PERMISSIONS.VIEW_PARTNERS,
    PERMISSIONS.VIEW_PAYROLL,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.USE_AI,
  ],
  
  [ROLES.FINANCE_MANAGER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_WORKFORCE,
    PERMISSIONS.VIEW_PAYROLL,
    PERMISSIONS.ADD_PAYROLL,
    PERMISSIONS.EDIT_PAYROLL,
    PERMISSIONS.PROCESS_PAYROLL,
    PERMISSIONS.VIEW_FINANCE,
    PERMISSIONS.ADD_TRANSACTION,
    PERMISSIONS.EDIT_TRANSACTION,
    PERMISSIONS.DELETE_TRANSACTION,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.USE_AI,
  ],
  
  [ROLES.COMPLIANCE_OFFICER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_COMPLIANCE,
    PERMISSIONS.ADD_COMPLIANCE,
    PERMISSIONS.EDIT_COMPLIANCE,
    PERMISSIONS.DELETE_COMPLIANCE,
    PERMISSIONS.EXPORT_DATA,
  ],
  
  [ROLES.SITE_MANAGER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_WORKFORCE,
    PERMISSIONS.VIEW_PARTNERS,
  ],
  
  [ROLES.EMPLOYEE]: [
    PERMISSIONS.VIEW_DASHBOARD,
  ],
};

// User database (in production, this would be in a database)
export const USERS = [
  {
    id: 1,
    username: 'admin',
    password: 'Vimanasa@2026', // In production, use hashed passwords
    role: ROLES.SUPER_ADMIN,
    name: 'Super Administrator',
    email: 'admin@vimanasa.com',
  },
  {
    id: 2,
    username: 'hr_manager',
    password: 'hr123',
    role: ROLES.HR_MANAGER,
    name: 'HR Manager',
    email: 'hr@vimanasa.com',
  },
  {
    id: 3,
    username: 'finance',
    password: 'finance123',
    role: ROLES.FINANCE_MANAGER,
    name: 'Finance Manager',
    email: 'finance@vimanasa.com',
  },
  {
    id: 4,
    username: 'compliance',
    password: 'compliance123',
    role: ROLES.COMPLIANCE_OFFICER,
    name: 'Compliance Officer',
    email: 'compliance@vimanasa.com',
  },
];

/**
 * Check if user has a specific permission
 * @param {string} userRole - User's role
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export function hasPermission(userRole, permission) {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
}

/**
 * Check if user can access a module
 * @param {string} userRole - User's role
 * @param {string} module - Module name (dashboard, workforce, etc.)
 * @returns {boolean}
 */
export function canAccessModule(userRole, module) {
  const modulePermissions = {
    dashboard: PERMISSIONS.VIEW_DASHBOARD,
    workforce: PERMISSIONS.VIEW_WORKFORCE,
    partners: PERMISSIONS.VIEW_PARTNERS,
    payroll: PERMISSIONS.VIEW_PAYROLL,
    finance: PERMISSIONS.VIEW_FINANCE,
    compliance: PERMISSIONS.VIEW_COMPLIANCE,
    ai: PERMISSIONS.USE_AI,
  };
  
  const requiredPermission = modulePermissions[module];
  return requiredPermission ? hasPermission(userRole, requiredPermission) : false;
}

/**
 * Get user by username and password
 * @param {string} username
 * @param {string} password
 * @returns {object|null}
 */
export function authenticateUser(username, password) {
  const user = USERS.find(u => u.username === username && u.password === password);
  if (user) {
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
}

/**
 * Get all permissions for a role
 * @param {string} role
 * @returns {Array}
 */
export function getRolePermissions(role) {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if user can perform action
 * @param {object} user - User object
 * @param {string} action - Action to perform
 * @returns {boolean}
 */
export function canPerformAction(user, action) {
  if (!user || !user.role) return false;
  return hasPermission(user.role, action);
}
