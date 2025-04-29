const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middlewares/auth');
const adminCheck = require('../middlewares/adminCheck');

// Define analytics routes with authentication and authorization
router.get('/', auth, adminCheck, analyticsController.getAnalytics);

// Add more specific analytics endpoints
router.get('/department', auth, adminCheck, analyticsController.getDepartmentAnalytics);
router.get('/attendance', auth, adminCheck, analyticsController.getAttendanceAnalytics);
router.get('/salary', auth, adminCheck, analyticsController.getSalaryAnalytics);

module.exports = router;