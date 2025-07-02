const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');

const protect = async (req, res, next) => {
  // 1) Get token from either Authorization header or cookies
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'You are not logged in! Please log in to get access.' 
    });
  }

  // 2) Verify token
  let decoded;
  try {
    decoded = await jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please log in again!'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your token has expired! Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Authentication failed!'
    });
  }

  // 3) Check if employee still exists
  const currentEmployee = await Employee.findById(decoded.id);
  if (!currentEmployee) {
    return res.status(401).json({
      success: false,
      message: 'The employee belonging to this token no longer exists.'
    });
  }

  // 4) Check if employee changed password after the token was issued
  if (currentEmployee.changedPasswordAfter(decoded.iat)) {
    return res.status(401).json({
      success: false,
      message: 'Employee recently changed password! Please log in again.'
    });
  }

  // 5) Grant access to protected route
  req.user = currentEmployee;
  res.locals.user = currentEmployee;
  next();
};

// Role-based access middleware
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // Handle both 'user' and 'employee' naming conventions
    const user = req.user || req.employee;
    
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};

// CSRF protection middleware (already in your server.js)
const csrfProtection = require('csurf')({ 
  cookie: true 
});

module.exports = { 
  protect, 
  restrictTo,
  csrfProtection
};