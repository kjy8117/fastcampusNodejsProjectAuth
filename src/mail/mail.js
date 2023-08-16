const mailer = require('nodemailer');
const welcome = require('./welcome');
const goodbye = require('./goodbye');

const getEmailData = (to, name, type) => {
    let data = null;
    switch( template ){
        case "welcome":
            data = {
                from: '<EMAIL>',
                to,
                subject: `Hello ${name}`,
                html: welcome()
            } 
            break;
        case "goodbye":
            data = {
                from: '<EMAIL>',
                to,
                subject: `Bye ${name}`,
                html: goodbye()
            } 
            break;
        default:
            data;   
    }
    return data;
};

const sendMail = (to, name, type) => {
    const transporter = mailer.createTransport({
        service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USERID,
                pass: process.env.EMAIL_PASSWORD
            }
        });

    const mail = getEmailData(to, name, type);
    
    transporter.sendMail(mail, (error, response) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Message sent: %s', response.message);
        }
        transporter.close();
    });
};

module.exports = sendMail;