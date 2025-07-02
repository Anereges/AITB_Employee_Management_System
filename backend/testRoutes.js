try {
  require('./routes/analytics');
  console.log('Analytics route loaded');
} catch (err) {
  console.error('Analytics route error:', err);
}

try {
  require('./routes/attendanceRoutes');
  console.log('Attendance route loaded');
} catch (err) {
  console.error('Attendance route error:', err);
}

try {
  require('./routes/departmentRoutes');
  console.log('Department route loaded');
} catch (err) {
  console.error('Department route error:', err);
}

try {
  require('./routes/employeeRoutes');
  console.log('Employee route loaded');
} catch (err) {
  console.error('Employee route error:', err);
}

try {
  require('./routes/leaveRoutes');
  console.log('Leave route loaded');
} catch (err) {
  console.error('Leave route error:', err);
}

try {
  require('./routes/payrollRoutes');
  console.log('Payroll route loaded');
} catch (err) {
  console.error('Payroll route error:', err);
}
