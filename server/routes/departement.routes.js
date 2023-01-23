const express = require('express');
const router = express.Router();

const { getDepartement, addDepartement, updateDepartement, deleteDepartement  } = require('../controllers/departement.controller')

const {verifyToken, verifyEmployee, verifyManager} = require('../middlewares/auth.middleware')

router.get('/departement/:id', getDepartement);
router.post('/:company/departement', verifyManager, addDepartement);
router.put('/departement/:id', verifyManager, updateDepartement);
router.delete('/:id/:company', verifyManager, deleteDepartement);

module.exports = router;
