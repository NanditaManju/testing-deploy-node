const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const crypto = require('crypto');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail');

exports.login = passport.authenticate('local', {
	failureRedirect :'/login',
	failureFlash:'Failed Login!',
	successRedirect : '/',
	successFlash : 'You are now logged In!'
});

exports.logout = (req, res) =>{
	req.logout();
	req.flash("success", "You are successfully logged out!!");
	res.redirect("/");
}

exports.isLoggedIn = (req, res,next)=>{
	if(req.isAuthenticated())
	{
		next();
		return;
	}
	req.flash("error","Oops!! You must be logged In to do that.");
	res.redirect('/login');
}

exports.forgot = async (req, res) =>{
	const user = await User.findOne({email : req.body.email});
	if(!user)
	{
		req.flash("error", "No account with this email exists!");
		return res.redirect("/login");
	}

	 user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
	 user.resetPasswordExpires = Date.now() + 3600000;
	await user.save();

	console.log(user);

	const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;

	await mail.send({
		user,
		subject: "Reset Password!",
		resetURL,
		filename:'password-reset'
	});
	req.flash("success", `You have been emailed a password reset link.<strong><a href = '${resetURL}'>Go to link -></a></strong>`);
	res.redirect('/login');
}

exports.resetPassword = async( req, res )=>{
	const user = await User.findOne
	({ 
		resetPasswordToken: req.params.resetPasswordToken,
		resetPasswordExpires: { $gt: Date.now() }
	});
	if(!user)
	{
		req.flash("error", "Your password reset token might have expired! try reset on more time.");
		res.redirect("/login");
	}

	res.render('resetPassword', {title : 'Reset Your Pssword'});
}

exports.matchPassword =  (req, res, next) =>{
	if( req.body.password === req.body['password-confirm']){
		next();
		return;
	}
	req.flash("error", "Passwords does not match!");
	res.redirect('back');
}

exports.updatePassword = async (req, res) =>{
	const user = await User.findOne ({
		resetPasswordToken : req.params.resetPasswordToken,
		resetPasswordExpires :  { $gt : Date.now()}
	});
	if(!user)
	{
		req.flash("error", "Password reset is invald or has expired!");
		return res.redirect("/login");
	}

	const setPassword = promisify(user.setPassword , user);
	await setPassword(req.body.password);

	user.resetPasswordToken = undefined;
	user.resetPasswordExpires = undefined;

	const updateUser = await user.save();
	await req.login(updateUser);
	req.flash("success",'Successfully updated password!!');
	res.redirect('/');
} 