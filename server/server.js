require('dotenv').config();
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { logEvents, logger } = require('./middlewares/logger.middleware');
const errorHandler = require('./utils/errorHandler');
const db = require('./config/db')
const  mongoose  = require('mongoose');
// set port
PORT = process.env.port || 8080

// connect to db
db();

// custom logging middleware
app.use(logger)

// built in middleware to parse data
app.use(express.json());

// third party middelware to parser data
app.use(cookieParser());

app.use(cors());

// define routes
app.use('/', require('./routes/auth.routes'));
app.use('/', require('./routes/employee.routes'));
app.use('/', require('./routes/company.routes'));
app.use('/', require('./routes/departement.routes'));
app.use('/', require('./routes/leave.routes'));

// custom errors detecting middleware
 app.use(errorHandler)

// running server
mongoose.connection.once('open', () => {
    console.log('connected to db');
    app.listen(PORT, () => {
        console.log(`server is running on port ${PORT}`)
    })
});

mongoose.connection.on('error', err => {
    console.log(err);
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 
    'mongoErrLog.log')
})
