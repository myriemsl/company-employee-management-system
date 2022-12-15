const express = require('express');
const router = express.Router();

const { register, verify, login, refrech, logout, forgotPassword, resetPassword } = require('../controllers/auth.controllers');

router.post('/register', register);
router.get('/user/verify/:id/:token', verify);
router.post('/login', login);
router.get('/refrech', refrech);
router.post('/logout', logout)
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword)

module.exports = router;