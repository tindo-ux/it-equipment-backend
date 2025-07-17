const express = require('express');
const router = express.Router();
const controller = require('../controllers/assignmentController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Assign equipment
router.post('/', [auth, role('admin')], controller.assignEquipment);

// View all assignments
router.get('/', [auth, role('admin')], controller.getAllAssignments);

module.exports = router;
