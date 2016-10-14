var nodemailer = require('nodemailer');
var local = require('../../config/local.js');

function sendMail(receiverAddress, mailSubject, message){
	 var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: local.email.address,
            pass: local.email.pass
        }
    });
	
	var mailOptions = {
		from   : local.email.address,
		to     : receiverAddress,
		subject: mailSubject,
		text   : message
	};
	
	transporter.sendMail(mailOptions, function(error, info){
		if(error){
			console.log(error);
//			res.json({yo: 'error'});
		}else{
			console.log('Message sent: ' + info.response);
//			res.json({yo: info.response});
		};
	});
}
 
module.exports = {
	sendMail : sendMail
}