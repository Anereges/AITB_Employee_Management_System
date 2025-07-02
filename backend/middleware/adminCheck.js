// middleware/adminCheck.js
module.exports = (req, res, next) => {
  if (req.employee && req.employee.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied: Admins only' });
};
