const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const employeeSchema =  new mongoose.Schema({
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
    password: {
        type : String, 
        required: true,
    },
    isManager: {
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
    },
    departement: {
        type : mongoose.Schema.Types.ObjectId, 
        ref: 'Departement', 
    },
    leaves: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Leave",
    }],
}, { timestamps: true,})


// encrypt password before saving to database
employeeSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }

    // hash password
    const hashedPassword = await bcrypt.hash(this.password, 10); 
    this.password = hashedPassword;
    next();
})

module.exports = mongoose.model('Employee', employeeSchema);