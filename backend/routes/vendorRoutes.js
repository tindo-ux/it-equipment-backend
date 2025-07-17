const express = require('express');
const router = express.Router();
const controller = require('../controllers/vendorController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Add vendor
router.post('/', [auth, role('admin')], controller.createVendor);

// Get all
router.get('/', [auth, role('admin')], controller.getVendors);

// Update
router.put('/:id', [auth, role('admin')], controller.updateVendor);

// Delete
router.delete('/:id', [auth, role('admin')], controller.deleteVendor);

module.exports = router;
