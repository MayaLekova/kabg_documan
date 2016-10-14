var fs = require('fs');
var nodemailer = require('nodemailer');
var local = require('../../config/local.js');

function sendMail(receiverAddress, mailSubject, message, docName, fullPath){
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: local.email.address,
            pass: local.email.pass
        }
    });

    console.log("sending: " + message);
    console.log("attaching: " + fullPath + " name: " + docName);

    var mailOptions = {
        from        : local.email.address,
        to          : receiverAddress,
        subject     : mailSubject,
        html        : message,
        attachments : [
            {
                filename : docName,
                content  : fs.createReadStream(fullPath)
            }
        ]
    };
    
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log('Message sent: ' + info.response);
        };
    });
}
 
module.exports = {
    sendMail : sendMail
}