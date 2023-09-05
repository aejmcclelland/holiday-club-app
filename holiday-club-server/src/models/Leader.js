const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const LeaderSchema = new mongoose.Schema({
	firstname: {
		type: String,
		required: [true, 'Please add a first name'],
	},
	surname: {
		type: String,
		required: [true, 'Please add a surname'],
	},
	slug: String,
	email: {
		type: String,
		required: [true, 'Please add an email'],
		unique: true,
		match: [
			/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
			'Please add a valid email',
		],
	},
	role: {
		type: String,
		enum: ['Sunday School', 'HBC', 'Connect', 'Senior Leader'],
		default: 'Senior Leader',
	},
	password: {
		type: String,
		required: [true, 'Please add a password'],
		minlength: 6,
		select: false,
	},
	resetPasswordToken: String,
	resetPasswordExpire: Date,
	createdAt: {
		type: Date,
		default: Date.now,
	},
});
// Create task slug from task name
LeaderSchema.pre('save', function (next) {
	const fullName = `${this.firstname} ${this.surname}`;
	this.slug = slugify(fullName, { lower: true });
	next();
});

// Encrypt password using bcrypt
LeaderSchema.pre('save', async function (next) {
	if (!this.isModified('password')) {
		next();
	}

	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

// Encrypt password using bcrypt while updating (admin)
LeaderSchema.pre('findOneAndUpdate', async function (next) {
	if (this._update.password) {
		this._update.password = await bcrypt.hash(this._update.password, 10);
	}
	next();
});

//Sign JWT and return
LeaderSchema.methods.getSignedJwtToken = function () {
	return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE,
	});
};

//Match user entered password to hashed password in database
LeaderSchema.methods.matchPassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

//Generate and hash password token
LeeaderSchema.methods.getResetPasswordToken = function () {
	//Generate token
	const resetToken = crypto.randomBytes(20).toString('hex');

	//Hash token and set to resetPasswordToken field
	this.resetPasswordToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');

	//Set expiry
	this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

	return resetToken;
};

// Generate email confirm token
LeadSchema.methods.generateEmailConfirmToken = function (next) {
	// email confirmation token
	const confirmationToken = crypto.randomBytes(20).toString('hex');

	this.confirmEmailToken = crypto
		.createHash('sha256')
		.update(confirmationToken)
		.digest('hex');

	const confirmTokenExtend = crypto.randomBytes(100).toString('hex');
	const confirmTokenCombined = `${confirmationToken}.${confirmTokenExtend}`;
	return confirmTokenCombined;
};

const Leader = mongoose.model('Leader', LeaderSchema, 'Leader');

module.exports = Leader;
