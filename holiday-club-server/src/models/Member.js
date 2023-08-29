const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');

const memberSchema = new mongoose.Schema(
	{
		firstname: {
			type: String,
			required: [true, 'Please add a first name'],
			trim: true,
		},
		surname: {
			type: String,
			required: [true, 'Please add a surname'],
			trim: true,
		},
		slug: String,
		description: {
			type: String,
			required: [true, 'Please add a description'],
		},
		dueDate: {
			type: Date,
		},
		priority: {
			type: String,
			enum: ['Low', 'Medium', 'High'],
			default: 'Medium',
		},
		status: {
			type: String,
			enum: ['Pending', 'In Progress', 'Completed'],
			default: 'Pending',
		},
		labels: {
			type: [String],
		},
		images: [
			{
				url: String,
				filename: String,
			},
		],
		address: {
			type: String,
		},
		location: {
			// GeoJSON Point
			type: {
				type: String,
				enum: ['Point'],
			},
			coordinates: {
				type: [Number],
				required: '2dsphere',
			},
			formattedAddress: String,
			street: String,
			city: String,
			state: String,
			zipcode: String,
			country: String,
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
		updatedAt: {
			type: Date,
			default: Date.now,
		},
		user: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			required: true,
		},
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

// Create task slug from task name
memberSchema.pre('save', function (next) {
	this.slug = slugify(this.task, { lower: true });
	next();
});

//Geocode & create location field
memberSchema.pre('save', async function (next) {
	const loc = await geocoder.geocode(this.address);
	this.location = {
		type: 'Point',
		coordinates: [loc[0].longitude, loc[0].latitude],
		formattedAddress: loc[0].formattedAddress,
		street: loc[0].streetName,
		streetNumber: loc[0].streetNumber,
		city: loc[0].city,
		state: loc[0].stateCode,
		zipcode: loc[0].zipcode,
		country: loc[0].countryCode,
	};
	//No need to save to database
	this.address = undefined;
	next();
});

const Member = mongoose.model('Member', memberSchema, 'Member');

module.exports = Member;
