const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const positionController = require('../controllers/positionController');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');

router.use(authorize.hrOrAdmin); // protect routes

// Create position
router.post(
  '/',
  [
    body('title').notEmpty().withMessage('Position title is required'),
    body('department').notEmpty().withMessage('Department is required'),
    body('salaryRange').optional().isString()
  ],
  validate,
  positionController.createPosition
);

// Get all positions
router.get('/', positionController.getPositions);

// Update position
router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid position ID'),
    body('title').optional().notEmpty(),
    body('department').optional(),
    body('salaryRange').optional()
  ],
  validate,
  positionController.updatePosition
);

// Delete position
router.delete(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid position ID')
  ],
  validate,
  positionController.deletePosition
);

module.exports = router;
