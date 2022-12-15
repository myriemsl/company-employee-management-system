const nodemailer = require('nodemailer');

const sendEmail = async(subject, message, sent_from, sent_to, reply_to) => {

    const transporter = nodemailer.createTransport({
        host: process.env.HOST,
        service: 'gmail',
        port: 465,
        secure: true,
        auth : {
            user: process.env.USER,
            pass: process.env.PASS,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });

    const options = {
        subject: subject,
        html: message,
        from: sent_from,
        to: sent_to,
        replyTo: reply_to,
    };

    transporter.sendMail(options, function (err, info) {
        if (err) { 
            console.log(err);
        } else {
            console.log(info);
        }
    });
};

module.exports = sendEmail;