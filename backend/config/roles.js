const roles = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    EMPLOYEE: 'employee',
  };
  
  // Permission matrix
  const permissions = {
    [roles.ADMIN]: {
      employees: ['create', 'read', 'update', 'delete'],
      profiles: ['read', 'update', 'delete'],
      settings: ['update']
    },
    [roles.MANAGER]: {
      employees: ['read', 'update'],
      profiles: ['read', 'update'],
      settings: []
    },
    [roles.EMPLOYEE]: {
      employees: ['read'],
      profiles: ['read', 'update:own'],
      settings: []
    }
  };
  
  // Check permission helper
  const hasPermission = (role, resource, action) => {
    return permissions[role]?.[resource]?.includes(action) || 
           permissions[role]?.[resource]?.some(perm => perm.startsWith(action));
  };
  
  module.exports = { 
    roles, 
    permissions,
    hasPermission 
  };