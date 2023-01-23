const mongoose = require('mongoose');

const departementSchema = new mongoose.Schema({
    departementname: {
        type: String,
        required: true,
    },
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
    },
    company: {
        type : mongoose.Schema.Types.ObjectId, 
        ref: 'Company', 
    },
    employees: [{
        type : mongoose.Schema.Types.ObjectId, 
        ref: 'Employee', 
    }],
}, { timestamps: true})

module.exports = mongoose.model('Departement', departementSchema);