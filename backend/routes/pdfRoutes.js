const express = require('express');
const router = express.Router();
const { generatePDFReport } = require('../controllers/pdfController');

router.get('/report', generatePDFReport);

module.exports = router;
