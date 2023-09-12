const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

//Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		//Set token from Bearer token in header
		token = req.headers.authorization.split(' ')[1];
		//Set token form cookie
	}
	//else if (req.cookies.token){
	//token = req.cookies.token;
	//}

	//Make sure token exists
	if (!token) {
		return next(new ErrorResponse('Not authorised to access this route', 401));
	}

	try {
		//Verify token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		// Check if the decoded token indicates a leader

		// Fetch user (parent) data
		req.user = await User.findById(decoded.id);
		if (!req.user) {
			return next(new ErrorResponse('User not found', 404));
		}
		next();
	} catch (err) {
		return next(new ErrorResponse('Not authorised to access this route', 401));
	}
});

// Grant access to specific roles
exports.authorise = (...roles) => {
	return (req, res, next) => {
		const userRole = req.user.role;
		const userActivity = req.user.activity;

		if (!roles.includes(userRole)) {
			return next(
				new ErrorResponse(
					`${req.user.role}s are not authorized to access this route`,
					403
				)
			);
		}
		//If user is aleader,also check their assigned activity
		if (userRole === 'leader') {
			const requestedActivity = req.params.activity;

			if (userActivity !== requestedActivity) {
				return next(
					new ErrorResponse(
						`You are not authorised to access this ${requestedActivity} route`,
						403
					)
				);
			}
		}
		next();
	};
};
