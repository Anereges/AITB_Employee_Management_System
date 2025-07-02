const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const auth = require('../middleware/authorize');
//const adminCheck = require('../middleware/adminCheck');
const validate = require('../middleware/validate');

// Protect all routes - only authenticated admins can manage departments
//router.use(auth);
//router.use(adminCheck);

// POST /api/departments
// Create a new department
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Department name is required'),
    body('description').optional().isString()
  ],
  validate,
  departmentController.createDepartment
);

// GET /api/departments
// Get list of all departments
router.get('/', departmentController.getDepartments);

// GET /api/departments/stats
// Get department statistics
router.get('/stats', departmentController.getDepartmentStats);

// PUT /api/departments/:id
// Update a department by ID
router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid department ID'),
    body('name').optional().notEmpty().withMessage('Department name cannot be empty'),
    body('description').optional().isString()
  ],
  validate,
  departmentController.updateDepartment
);

// DELETE /api/departments/:id
// Delete a department by ID
router.delete(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid department ID')
  ],
  validate,
  departmentController.deleteDepartment
);

module.exports = router;