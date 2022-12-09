const mongoose = require('mongoose');


const userSchema =  mongoose.Schema({
    fullname: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        trim: true,
    },
    username: {
        type: String, 
        required: true,
    },
    password: {
        type : String, 
        required: true,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: false,
    }
})


module.exports = mongoose.model('User', userSchema);