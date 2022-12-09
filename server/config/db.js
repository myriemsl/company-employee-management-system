const mongoose = require('mongoose');
require('dotenv').config({path:'./config/.env'});


const db = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
    } catch (err) {
        console.log(err)
    }
}

module.exports = db;
