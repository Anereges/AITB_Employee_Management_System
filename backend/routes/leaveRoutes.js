// 1. Import dependencies and controllers at the top
const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const authController = require('../controllers/auth.controller');

// 2. Protect all routes with authentication middleware
router.use(authController.protect);

// 3. Employee routes (accessible to any authenticated employee)
router.post('/request', leaveController.createLeaveRequest);
router.get('/my-requests', leaveController.getMyLeaveRequests);
router.patch('/cancel/:id', leaveController.cancelLeaveRequest);

// 4. Admin/HR routes - restrict access to admin and HR roles
router.use(authController.restrictTo('admin', 'hr'));

// 5. Admin/HR leave management routes
router.get('/leave-requests/pending', leaveController.getPendingRequests);        // <== Your /pending route here
router.get('/all', leaveController.getAllLeaveRequests);
router.patch('/approve/:id', leaveController.approveLeaveRequest);
router.patch('/reject/:id', leaveController.rejectLeaveRequest);
router.get('/stats', leaveController.getLeaveStatistics);

// 6. Export the router
module.exports = router;
