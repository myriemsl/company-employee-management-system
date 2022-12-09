const express = require('express');
const router = express.Router();

const { register, login, refrech, logout } = require('../controllers/auth.controllers');

router.post('/register', register);
router.post('/login', login);
router.get('/refrech', refrech);
router.post('/logout', logout)

module.exports = router;