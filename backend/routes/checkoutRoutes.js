const express = require('express');
const router = express.Router();
const controller = require('../controllers/checkoutController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// User checkout
router.post('/', auth, controller.checkout);

// User returns item
router.put('/:id/return', auth, controller.returnEquipment);

// Admin or user views their checkouts
router.get('/mine', auth, controller.getMyCheckouts);

// Admin views all
router.get('/', [auth, role('admin')], controller.getAllCheckouts);

module.exports = router;
