const express = require('express');
const router = express.Router();
const controller = require('../controllers/equipmentController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// GET all
router.get('/', controller.getAllEquipment);

// GET by ID
router.get('/:id', controller.getEquipmentById);

// POST new
router.post('/', [auth, role('admin')], controller.createEquipment);

// PUT update
router.put('/:id', [auth, role('admin')], controller.updateEquipment);

// DELETE
router.delete('/:id', [auth, role('admin')], controller.deleteEquipment);

module.exports = router;
