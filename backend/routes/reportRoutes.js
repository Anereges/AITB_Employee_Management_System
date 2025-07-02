const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authorize');
const { generateAdminReport } = require('../controllers/reportController');  


// ✅ Employee Reports (for logged-in employee users)
router.get('/employee', protect, reportController.generateEmployeeReport);  // No change here

// ✅ Admin Reports (requires admin or manager roles)
router.get('/admin', protect, authorize('admin', 'manager'), generateAdminReport);  // <-- Use the imported function directly

// ✅ Filters for admin reporting (like department list, roles, etc.)
router.get('/admin/filters', protect, authorize('admin', 'manager'), reportController.getFilterOptions);

// ✅ Overview Reports (dashboard summary like stats between dates)
router.get(
  '/overview',
  protect,
  authorize('admin', 'manager'),
  reportController.getOverviewReport
);

module.exports = router;
