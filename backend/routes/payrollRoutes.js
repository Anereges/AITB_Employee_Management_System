const express = require('express');
const router = express.Router();
const { generatePayroll, getPayroll } = require('../controllers/payrollController');
const auth = require('../middlewares/auth');

router.post('/generate', auth, generatePayroll);
router.get('/', auth, getPayroll);

module.exports = router;
