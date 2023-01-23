const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    companyname: {
        type: String,
        required: true,
    },
    url: {
        type: String,
    },
    address: {
        type: String,
    },
    postalcode: {
        type: String,
    },
    fax: {
        type: String,
    },
    contact: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    departements: [{
        type : mongoose.Schema.Types.ObjectId, 
        ref: 'Departement', 
    }],
}, { timestamps: true})

module.exports = mongoose.model('Company', companySchema);