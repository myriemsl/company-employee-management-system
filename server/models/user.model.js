const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema =  mongoose.Schema({
    fullname: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "pleaser enter a valid email"],
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
    },
    isVerified: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true,})


// encrypt password before saving to database
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }

    // hash password
    const hashedPassword = await bcrypt.hash(this.password, 10); 
    this.password = hashedPassword;
    next();
})

module.exports = mongoose.model('User', userSchema);