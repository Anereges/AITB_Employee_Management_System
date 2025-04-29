const createError = require('http-errors');

// Role hierarchy (higher roles inherit lower permissions)
const roleHierarchy = {
  employee: 0,
  manager: 1,
  admin: 2
};

const authorize = (roles = []) => {
  // Normalize input to array
  if (typeof roles === 'string') roles = [roles];

  return (req, res, next) => {
    // 1. Check if user exists
    if (!req.user) {
      return next(createError(401, 'Not authenticated'));
    }

    // 2. Check if user has required role or higher
    const userRoleLevel = roleHierarchy[req.user.role];
    const hasAccess = roles.some(role => {
      return userRoleLevel >= roleHierarchy[role];
    });

    if (!hasAccess) {
      return next(createError(403, `Requires ${roles.join(' or ')} role`));
    }

    next();
  };
};

// Special case middleware
authorize.admin = authorize('admin');
authorize.managerOrAdmin = authorize(['manager', 'admin']);

module.exports = authorize;