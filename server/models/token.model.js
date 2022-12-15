const mongoose = require("mongoose");

const tokenSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user',
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