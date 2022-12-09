const express = require('express');
const router = express.Router();

const { getAllUsers, updateUser, deleteUser, updateStatus } = require('../controllers/user.controller')

const {verifyToken, verifyUser, verifyAdmin} = require('../middlewares/auth.middleware')

router.get('/users', verifyAdmin, getAllUsers);
router.put('/user/:id', verifyUser, updateUser);
router.delete('/user/:id', verifyUser, deleteUser);
router.patch('/user/status/:id', verifyAdmin, updateStatus);

module.exports = router;
