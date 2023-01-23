const express = require('express');
const router = express.Router();

const { getCompany, addCompany, updateCompany, deleteCompany  } = require('../controllers/company.controller')

const {verifyToken, verifyEmployee, verifyManager} = require('../middlewares/auth.middleware')

router.get('/company/:id', getCompany);
router.post('/company', verifyManager, addCompany);
router.put('/company/:id', verifyManager, updateCompany);
router.delete('/company/:id', verifyManager, deleteCompany);

module.exports = router;
