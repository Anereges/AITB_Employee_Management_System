const roles = {
  ADMIN: 'admin',
  HR: 'hr',
  EMPLOYEE: 'employee'
};

// Permission matrix with more granular controls
const permissions = {
  [roles.ADMIN]: {
    employees: ['create', 'read', 'update', 'delete', 'approve', 'reject'],
    profiles: ['read', 'update', 'delete'],
    payroll: ['create', 'read', 'update', 'delete', 'process'],
    leaves: ['create', 'read', 'update', 'delete', 'approve', 'reject'],
    settings: ['update'],
    dashboard: ['full_access']
  },
  [roles.HR]: {
    employees: ['read', 'update'],
    profiles: ['read', 'update'],
    payroll: ['read', 'process'],
    leaves: ['read', 'approve', 'reject'],
    settings: [],
    dashboard: ['limited_access']
  },
  [roles.EMPLOYEE]: {
    employees: ['read:self'],
    profiles: ['read:self', 'update:self'],
    payroll: ['read:self'],
    leaves: ['create:self', 'read:self'],
    settings: [],
    dashboard: ['self_access']
  }
};

// Enhanced permission checker
const hasPermission = (role, resource, action) => {
  const rolePermissions = permissions[role];
  
  if (!rolePermissions) return false;
  
  // Check for direct permission
  if (rolePermissions[resource]?.includes(action)) {
    return true;
  }
  
  // Check for wildcard permissions (e.g., 'update:self')
  return rolePermissions[resource]?.some(perm => {
    if (perm === '*') return true; // Full access
    if (perm === `${action}:*`) return true; // All actions of this type
    return perm.startsWith(`${action}:`);
  });
};

// Check if user can access resource (with owner validation)
const canAccess = (user, resource, action, resourceOwnerId = null) => {
  // Admin bypasses ownership checks
  if (user.role === roles.ADMIN) return true;
  
  // Check basic permission
  if (!hasPermission(user.role, resource, action)) {
    return false;
  }
  
  // Check ownership for self actions
  const permission = permissions[user.role][resource]?.find(p => p.startsWith(action));
  if (permission?.endsWith(':self')) {
    return user._id.equals(resourceOwnerId);
  }
  
  return true;
};

module.exports = { 
  roles, 
  permissions,
  hasPermission,
  canAccess
};