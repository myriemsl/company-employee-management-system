const express = require('express');
const router = express.Router();

const { getAllEmployees, addEmployee, updateEmployee, deleteEmployee, setRole, setStatus, contact } = require('../controllers/employee.controller')

const {verifyToken, verifyEmployee, verifyManager} = require('../middlewares/auth.middleware')

router.get('/employees', verifyManager, getAllEmployees);
router.post('/add/employee', verifyManager, addEmployee);
router.put('/employee/:id', verifyEmployee, updateEmployee);
router.delete('/employee/:id', verifyEmployee, deleteEmployee);
router.patch('/employee/role/:id', verifyManager, setRole);
router.patch('/employee/status/:id', verifyManager, setStatus);
router.post('/employee/contact', contact);

module.exports = router;
