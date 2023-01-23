const express = require('express');
const router = express.Router();

const { applyLeave, getLeave, updateLeave, setStatusLeave, deleteLeave } = require('../controllers/leave.controller')

const {verifyToken, verifyEmployee, verifyManager} = require('../middlewares/auth.middleware')

router.post('/:employee/leave', verifyEmployee, applyLeave);
router.get('/leave/:id',  verifyEmployee, getLeave);
router.put('/leave/:id', verifyEmployee, updateLeave);
router.put('/leave/status/:id', verifyManager, setStatusLeave);
router.delete('/:id/:employee', verifyEmployee, deleteLeave);

module.exports = router;
