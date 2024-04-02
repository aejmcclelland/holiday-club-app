const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const mapRoleToFamily = require('./roleMapper');
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
		req.user = await User.findById(decoded.id);
		if (!req.user) {
			return next(new ErrorResponse('User not found', 404));
		}
		// Allow account creation route to proceed without checking for existing user
		if (req.originalUrl === '/api/auth/users' && req.method === 'POST') {
			return next();
		}
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
// Create account authorization middleware
exports.allowAccountCreation = (...roles) => {
	return (req, res, next) => {
		const userRole = req.userRole; // Use user's role from the request object
		if (!roles.includes(userRole)) {
			return next(
				new ErrorResponse('You are not authorised to create an account', 403)
			);
		}
		next();
	};
};

// Update authorise middleware to include new roles
exports.authorise = (...roles) => {
	return (req, res, next) => {
		const userRole = req.user.role;
		const userActivity = req.user.activity;
		console.log(userRole);
		// Map user role to 'family' if applicable
		const mappedRole = mapRoleToFamily(userRole);
		console.log(mappedRole);
		// Check if the user's role is admin or family
		if (
			!(
				userRole === 'admin' ||
				userRole === 'leader' ||
				mappedRole === 'family'
			)
		) {
			return next(
				new ErrorResponse(
					`User role ${
						userRole ? userRole : mappedRole
					} is not authorised to access this route`,
					403
				)
			);
		}
		// If user is a leader, also check their assigned activity
		if (userRole === 'leader' && req.params.activity) {
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
