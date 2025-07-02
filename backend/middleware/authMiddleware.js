const jwt = require('jsonwebtoken');
const { Employee } = require('../models/Employee')

const protect = async (req, res, next) => {
  let token;

  console.log('🛡️ Auth middleware hit');

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ message: 'Not authenticated, no token' });
  }

  try {
    console.log('🔐 Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verified. Decoded:', decoded);

    console.log('👤 Finding employee by ID...');
    const employee = await Employee.findById(decoded.id).select('-password');

    if (!employee) {
      console.log('❌ Employee not found');
      return res.status(401).json({ message: 'User not found' });
    }

    console.log('✅ Employee found:', employee.email);
    req.employee = employee;
    next();

  } catch (err) {
    console.error('🚨 JWT or DB error in auth middleware:', err.message);
    return res.status(401).json({ message: 'Invalid token or DB error' });
  }
};

module.exports = protect;
