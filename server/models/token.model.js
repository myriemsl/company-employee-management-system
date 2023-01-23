const mongoose = require("mongoose");

const tokenSchema = mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'employee',
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
    },
    expiresAt: {
        type: Date,
    },
});

module.exports = mongoose.model('Token', tokenSchema);