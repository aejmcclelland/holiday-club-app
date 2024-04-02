const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const Member = require('../models/Member');
const mapRoleToFamily = require('../middleware/roleMapper');

//@desc     Get all users
//@route    GET /api/auth/users
//@access   Private/Admin
exports.getAllUsers = asyncHandler(async (req, res, next) => {
	res.status(200).json(res.advancedResults);
});

//@desc     Get single user by first name and surname
//@route    GET /api/auth/users
//@access   Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
	const { firstname, surname } = req.query; // Assuming you're passing firstname and surname as query parameters
	// Check if both first name and surname are provided
	if (!firstname || !surname) {
		return next(
			new ErrorResponse('Please provide both first name and surname', 400)
		);
	}
	// Find the user by first name and surname
	const user = await User.findOne({ firstname, surname });
	if (!user) {
		return next(
			new ErrorResponse(
				`User not found with name: ${firstname} ${surname}`,
				404
			)
		);
	}

	res.status(200).json({
		success: true,
		data: user,
	});
});

//@desc     Create user
//@route    POST /api/auth/users
//@access   Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
	// Extract role from the request body
	const { role, ...otherUserData } = req.body;

	// Map selected role to 'family'
	const familyRole = mapRoleToFamily(role);

	// Create user object with 'family' role
	const userData = { role: familyRole, ...otherUserData };

	// Pass the user's role to the allowAccountCreation middleware
	req.userRole = role;

	// Create user in the database
	const user = await User.create(userData);

	res.status(201).json({ success: true, data: user });
});

// exports.createUser = asyncHandler(async (req, res, next) => {
// 	const { role } = req.body;

// 	// Check if the role is "leader"
// 	if (role === 'leader') {
// 		// Check if the authenticated user has the "admin" role
// 		if (req.user.role !== 'admin') {
// 			return next(
// 				new ErrorResponse('Only admin users can create leader users', 403)
// 			);
// 		}
// 	}

// 	const user = await User.create(req.body);

// 	res.status(201).json({
// 		success: true,
// 		data: user,
// 	});
// });

//@desc     Update user
//@route    PUT /api/auth/users/:id
//@access   Private
exports.updateUser = asyncHandler(async (req, res, next) => {
	// Check if the user is trying to update their own details or if an admin is updating
	if (req.user.id !== req.params.id && req.user.role !== 'admin') {
		return next(new ErrorResponse('Not authorized to update this user', 403));
	}

	// Update the user details
	const user = await User.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		success: true,
		data: user,
	});
});

//@desc     Delete user
//@route    DELETE /api/auth/users
//@access   Private
exports.deleteUser = asyncHandler(async (req, res, next) => {
	const { firstname, surname } = req.query;

	// Find the user by first name and surname
	const user = await User.findOne({ firstname, surname });

	if (!user) {
		return next(
			new ErrorResponse(
				`User not found with first name "${firstname}" and surname "${surname}"`,
				404
			)
		);
	}

	// Check if the user is trying to delete their own details or if an admin is deleting
	if (req.user.id !== user.id && req.user.role !== 'admin') {
		return next(new ErrorResponse('Not authorized to delete this user', 403));
	}

	// If the user is a carer, delete their associated members
	if (user.role === 'carer') {
		await Member.deleteMany({ carer: user._id });
	}

	await User.deleteOne({ _id: user._id });

	res.status(200).json({
		success: true,
		data: {},
	});
});
