const mongoose = require('mongoose');

const leaveSchema =  new mongoose.Schema({
    subject: {
        type : String,
        required: true,
    },
    from: {
        type : Date, 
        required: true,
    },
    to: {
        type : Date,
        required: true,
    },
    status: {
        type : String,
        enum: ["pending", "approved", "denied"],
        default: "pending"
    },
    employee: {
        type : mongoose.Schema.Types.ObjectId,
        ref: "Employee",
    },
    departement: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Departement",
    },
    applieddate: {
        type: Date,
        default: Date.now()
    },
}, { timestamps: true,})

module.exports = mongoose.model('Leave', leaveSchema);