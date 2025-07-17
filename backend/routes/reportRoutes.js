const express = require('express');
const router = express.Router();
const { generatePDFReport } = require('../controllers/pdfController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// @route   GET api/pdf/report
// @desc    Generate a PDF report of equipment requests
// @access  Admin
router.get('/report', [auth, role('admin')], generatePDFReport);

module.exports = router;