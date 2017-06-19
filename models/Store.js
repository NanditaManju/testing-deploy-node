const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const slug = require('slugs');

const storeSchema = new mongoose.Schema({
name : {
 type: String,
 trim : true,
 required: 'Please Enter a store name!'
},
slug : String,
description : 
{
	type :String,
	trim : true
},
tags : [String],
location : 
{
	type :
	{
		type : String,
		default : 'Point'
	},
	coordinates : [{
		type:Number,
		required : 'You Must Supply coordinates!'
	}],
	address :
	{
		type : String,
		required : 'You must supply Address!'
	}
},
photo:String,
author : { 
		type: mongoose.Schema.ObjectId,
		ref :'User',
		Required : "You must supply an Author"
	}
});

storeSchema.index({
	name :'text',
	description: 'text'
});

storeSchema.index({
	location : '2dsphere'
},
{
	toJSON :{virtuals:true},
	toObject :{virtuals:true}
});

storeSchema.pre('save',async function(next){
	if(!this.isModified('name'))
	{
		next(); // skip it
		return;
	}
	this.slug = slug(this.name);

	const slugRegExp = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');

	const storesWithSlug = await this.constructor.find({slug : slugRegExp});
	if(storesWithSlug.length)
	{
		this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
	}
	next();
})

storeSchema.statics.getTagsList = function() {
	return this.aggregate([
		{ $unwind : '$tags'},
		{	$group : { _id : '$tags', count: { $sum: 1 }}	},
		{	$sort : { count:-1 }}
		]);
}

storeSchema.statics.getTopStores = function() {
	return this.aggregate([
		// Lookup Stores and populate their reviews
		{ $lookup: { from: 'reviews', localField:'_id', foreignField:'store', as:'reviewList'}},
		// filter for only items that have 2 or more reviews
		{ $match: { 'reviewList.1':{ $exists: true}}},
		// add the average reviews field
		{ $project: { 
			photo: '$$ROOT.photo',
			name: '$$ROOT.name',
			reviews: '$$ROOT.reviewList',
			slug:'$$ROOT.slug',
			averageRating: {$avg: '$reviewList.rating'}
		}},
		// sort it by new field, highest reviews first
		{ $sort: { averageRating : -1 }},
		// limit to at most 10
		{ $limit : 10 }
	]);
}

storeSchema.virtual('reviews',{
	ref:'Review',
	localField: '_id',
	foreignField:'store'
});

function autopopulate(next) {
	this.populate('reviews');
	next();
}

storeSchema.pre('find',autopopulate);
storeSchema.pre('findOne',autopopulate);

module.exports = mongoose.model('Store',storeSchema);