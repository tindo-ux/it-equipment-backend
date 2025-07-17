const express = require('express');
const router = express.Router();
const controller = require('../controllers/requestController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// User creates a request
router.post('/', auth, controller.createRequest);

// User views their requests
router.get('/mine', auth, controller.getMyRequests);

// Admin gets all requests
router.get('/', [auth, role('admin')], controller.getAllRequests);

// Admin updates request status
router.put('/:id/status', [auth, role('admin')], controller.updateRequestStatus);

module.exports = router;
