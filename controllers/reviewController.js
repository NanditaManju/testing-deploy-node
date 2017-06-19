const mongoose = require('mongoose');
const Review = mongoose.model('Review');

exports.addReview = async(req, res)=>{
	req.body.author = req.user._id;
	req.body.store = req.params.id;

	//res.json(req.body);
	const review = await (new Review(req.body)).save();
	
	req.flash("success",`Thank you for leaving the Review !!`);
	//res.render('viewStore',{title:`${store.name}`, store});

	res.redirect('back');
}