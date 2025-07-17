const express = require('express');
const router = express.Router();
const { register, login, getAllUsers } = require('../controllers/authController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', register);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', login);

// @route   GET api/auth/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', [auth, role('admin')], getAllUsers);

module.exports = router;