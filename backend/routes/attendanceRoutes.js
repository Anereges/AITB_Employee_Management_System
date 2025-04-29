const express = require('express');
const router = express.Router();
const {
    checkIn, 
    checkOut,
    getAttendance,
    getEmployeeAttendance,
    getAttendanceSummary
} = require('../controllers/attendanceController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { check } = require('express-validator');

// Attendance routes with validation
router.post('/check-in', 
    auth,
    [
        check('location').optional().isString(),
        check('notes').optional().isString().isLength({ max: 500 })
    ],
    validate,
    checkIn
);

router.post('/check-out', 
    auth,
    [
        check('location').optional().isString(),
        check('notes').optional().isString().isLength({ max: 500 })
    ],
    validate,
    checkOut
);

// Get routes with query parameters
router.get('/', 
    auth,
    [
        check('from').optional().isISO8601(),
        check('to').optional().isISO8601(),
        check('employeeId').optional().isMongoId()
    ],
    validate,
    getAttendance
);

// Additional attendance endpoints
router.get('/summary', auth, getAttendanceSummary);
router.get('/employee/:id', 
    auth,
    [
        check('id').isMongoId(),
        check('month').optional().isInt({ min: 1, max: 12 }),
        check('year').optional().isInt({ min: 2000, max: 2100 })
    ],
    validate,
    getEmployeeAttendance
);

module.exports = router;