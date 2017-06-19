const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.login = (req, res)=>{
	res.render('login',{title: 'Login'});
}

exports.register = (req, res)=>{
	res.render('register',{title: 'Register'});
}


exports.validateRegister = (req, res, next)=>{
 req.sanitizeBody('name');
 req.checkBody('name','You Must Supply Name!').notEmpty();
 req.checkBody('email',"That Email is not valid!").isEmail();
 req.sanitizeBody('email').normalizeEmail({
 	gmail_remove_dots : false,
 	remove_extension : false,
 	gmail_remove_subaddress : false
 });
 req.checkBody('password','Password cannot be Empty!').notEmpty();
 req.checkBody('password-confirm','Confirm Password Cannot be Empty!').notEmpty();
 req.checkBody('password-confirm','Your password does not match!').equals(req.body.password);

 const errors = req.validationErrors();
 if(errors)
 {
 	req.flash("error",errors.map(err=> err.msg));
 	res.render('register',{title:'Register' , Body: req.body, flashes: req.flash()});
 	return;
 }
 next();
};

exports.createUser = async ( req, res ,next )=>{
//	console.log(req.body);
	const user = new User({ email: req.body.email, name: req.body.name });
//console.log(user);
	const register = promisify( User.register, User);
	await register(user,req.body.password);
	next();
}


exports.account = (req, res) =>{
	res.render('account', {title: "Edit Your Account"});
}

exports.updateAccount = async (req, res )=> {
	const updates = {
		name : req.body.name,
		email : req.body.email
	}

	const user = await User.findOneAndUpdate(
		{ _id : req.user._id },
		{$set : updates },
		{ new: true, runValidators: true, context:'query'}
	);

	req.flash('success', "Your Account has been updated successfully!!");
	res.redirect('back');
}


