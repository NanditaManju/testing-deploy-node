const nodemailer = require('nodemailer');
const pug = require('pug');
const juice = require('juice');
const htmlToText = require('html-to-text');
const promisify = require('es6-promisify');


const transport = nodemailer.createTransport({
	host: process.env.MAIL_HOST,
	port: process.env.MAIL_PORT,
	auth:{
		user: process.env.MAIL_USER,
		pass: process.env.MAIL_PASS
	}
});

const generateHtml = (fileName, options = {})=>{
	const html = pug.renderFile(`${__dirname}/../views/email/${fileName}.pug`,options);
	return html;
}

exports.send = async(options) => {

	const html= generateHtml(options.filename,options);
	const text = htmlToText.fromString(html);
	const mailOptions ={
		from : 'nanda.sn5@gmail.com',
		to : options.user.email,
		subject: options.subject,
		html,
		text
	}
	const sendMail = promisify(transport.sendMail,transport);
	return sendMail(mailOptions);
}
