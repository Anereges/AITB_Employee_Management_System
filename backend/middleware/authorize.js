const createError = require('http-errors');
const { roles, canAccess } = require('../config/roles');

const authorize = (options = {}) => {
  // Options can be { resource, action } or role names
  return (req, res, next) => {
    // 1. Check authentication
    if (!req.employee) {
      return next(createError(401, 'Not authenticated'));
    }

    // 2. Handle role-based authorization
    if (typeof options === 'string' || Array.isArray(options)) {
      const requiredRoles = Array.isArray(options) ? options : [options];
      
      if (!requiredRoles.includes(req.employee.role)) {
        return next(createError(403, 
          `Requires ${requiredRoles.join(' or ')} role`));
      }
      return next();
    }

    // 3. Handle resource-based authorization
    if (options.resource && options.action) {
      let resourceOwnerId = null;
      
      // Determine resource ownership (for :self permissions)
      if (options.ownerField && req.params[options.ownerField]) {
        resourceOwnerId = req.params[options.ownerField];
      } else if (req.body.employee) {
        resourceOwnerId = req.body.employee;
      }
      
      if (!canAccess(req.employee, options.resource, options.action, resourceOwnerId)) {
        return next(createError(403, 
          `Not authorized to ${options.action} ${options.resource}`));
      }
      return next();
    }

    return next(createError(500, 'Invalid authorization configuration'));
  };
};

// Pre-defined authorizations
authorize.admin = authorize(roles.ADMIN);
authorize.hrOrAdmin = authorize([roles.HR, roles.ADMIN]);
authorize.employee = authorize(roles.EMPLOYEE);

// Resource-based authorizations
authorize.manageEmployees = authorize({
  resource: 'employees',
  action: '*',
  ownerField: 'id'
});

authorize.managePayroll = authorize({
  resource: 'payroll',
  action: '*'
});

authorize.manageLeaves = authorize({
  resource: 'leaves',
  action: '*'
});

module.exports = authorize;