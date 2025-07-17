const express = require('express');
const router = express.Router();
const controller = require('../controllers/maintananceController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Report an issue
router.post('/', auth, controller.reportIssue);

// Get all issues
router.get('/', [auth, role('admin')], controller.getAll);

// Update maintenance status
router.put('/:id', [auth, role('admin')], controller.updateStatus);

module.exports = router;
