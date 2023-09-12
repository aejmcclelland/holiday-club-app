const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

//@desc     Get all users
//@route    GET /api/auth/users
//@access   Private/Admin
exports.getAllUsers = asyncHandler(async (req, res, next) => {
	res.status(200).json(res.advancedResults);
});

//@desc     Get single user
//@route    GET /api/auth/users/:id
//@access   Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.params.id);

	res.status(200).json({
		success: true,
		data: user,
	});
});

//@desc     Create user
//@route    POST /api/auth/users
//@access   Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
	const { role } = req.body;

	// Check if the role is "leader"
	if (role === 'leader') {
		// Check if the authenticated user has the "admin" role
		if (req.user.role !== 'admin') {
			return next(
				new ErrorResponse('Only admin users can create leader users', 403)
			);
		}
	}

	const user = await User.create(req.body);

	res.status(201).json({
		success: true,
		data: user,
	});
});

//@desc     Update user
//@route    PUT /api/auth/users/:id
//@access   Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
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
//@route    DELETE /api/auth/users/:id
//@access   Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
	const user = await User.findByIdAndDelete(req.params.id);

	res.status(200).json({
		success: true,
		data: {},
	});
});
