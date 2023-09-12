const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const slugify = require('slugify');
const Member = require('../models/Member');
const User = require('../models/User');

//@desc     Get all members
//@route    GET /api/club
//@access   Private
exports.getMembers = asyncHandler(async (req, res, next) => {
	res.status(200).json(res.advancedResults);
	console.log(req.body);
});

//@desc     Get one member
//@route    GET /api/club/:id
//@access   Public
exports.getMember = asyncHandler(async (req, res, next) => {
	const member = await Member.findById(req.params.id);

	if (!member) {
		return next(
			new ErrorResponse(`Member not found with id of ${req.params.id}`, 404)
		);
	}

	// Check if the requesting user is an admin or the parent/carer of the member
	if (
		req.user.role === 'admin' ||
		req.user.id === member.user.toString() ||
		(member.carer && req.user.id === member.carer.toString())
	) {
		return res.status(200).json({ success: true, data: member });
	}

	return next(new ErrorResponse('Not authorized to access this member', 403));
});
//@desc     Get children
//@route    GET /api/club/children
//@access   Private
exports.getChildren = asyncHandler(async (req, res, next) => {
	// Find all members that belong to the current user (parent)
	const children = await Member.find({ user: req.user.id });
	console.log('children', children);
	res.status(200).json({ success: true, data: children });
});

//@desc     Create new children
//@route    POST /api/club
//@access   Private/Parent
exports.createMember = asyncHandler(async (req, res, next) => {
	//Add user to req.body
	req.body.user = req.user.id;

	//Check for published task
	const existingMember = await Member.findOne({
		user: req.user.id,
		fullName: req.body.fullName,
	});

	//if the user is not the publisher, they cannot view
	// if (publishedMember && req.user.role !== 'admin') {
	// 	return next(
	// 		new ErrorResponse(
	// 			`The user with ID ${req.user.id} has already added this child`,
	// 			400
	// 		)
	// 	);
	// }
	if (existingMember) {
		return next(
			new ErrorResponse(
				`The user with ID ${req.user.id} has already added this child`,
				400
			)
		);
	}
	const member = await Member.create({ ...req.body });
	res.status(201).json({ success: true, data: member });
});

//@desc     Update member
//@route    PUT /api/club/:id
//@access   Private/Parent
exports.updateMember = asyncHandler(async (req, res, next) => {
	let member = await Member.findById(req.params.id);

	if (!member) {
		return next(
			new ErrorResponse(`Member not found with id of ${req.params.id}`, 404)
		);
	}
	// Check if the requesting user is an admin
	if (
		req.user.role === 'admin' &&
		req.user.id !== member.user.toString() &&
		(!member.carer || req.user.id !== member.carer.toString())
	) {
		return next(
			new ErrorResponse(
				`User ${req.user.id} is not authorised to update this meber`,
				403
			)
		);
	}
	//update slug when updating name
	if (Object.keys(req.body).includes('fullName')) {
		req.body.slug = slugify(req.body.name, { lower: true });
	}
	member = await Member.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({ success: true, data: member });
});

//@desc     Delete child/member
//@route    DELETE /api/club/:id
//@access   Private/Parent
exports.deleteMember = asyncHandler(async (req, res, next) => {
	const member = await Member.findById(req.params.id);

	if (!member) {
		return next(
			new ErrorResponse(`Task not found with id of ${req.params.id}`, 404)
		);
	}

	//Make sure user is member owner
	if (
		req.user.role !== 'admin' &&
		req.user.id !== member.user.toString() &&
		(!member.carer || req.user.id !== member.carer.toString())
	) {
		return next(
			new ErrorResponse(
				`User ${req.user.id} is not authorised to delete this task`,
				401
			)
		);
	}

	task.deleteOne();

	res.status(200).json({ success: true, data: {} });
});

//@desc     Get member by activity
//@route    GET /api/club/:activity/:id
//@access   Private
exports.getChild = asyncHandler(async (req, res, next) => {
	const member = await Member.findById(req.params.id);

	if (!member) {
		return next(
			new ErrorResponse(`Task not found with id of ${req.params.id}`, 404)
		);
	}
	// Check if the user has permission to access this route
	if (
		req.user.role === 'admin' ||
		req.user.role === 'parent' ||
		(req.user.role === 'leader' && req.user.activity === req.params.activity)
	) {
		// Check if the retrieved member's activity matches the requested activity
		if (member.activity === req.params.activity) {
			return res.status(200).json({ success: true, data: member });
		} else {
			return next(
				new ErrorResponse(
					`Member with id ${req.params.id} is not in the specified activity`,
					403
				)
			);
		}
	} else {
		return next(new ErrorResponse('Not authorized to access this route', 403));
	}
});

//@desc     Get all members by activity
//@route    GET /api/club/:activity
//@access   Private
exports.getChildren = asyncHandler(async (req, res, next) => {
	try {
		// Check if the user has permission to access this route
		if (
			req.user.role === 'admin' ||
			req.user.role === 'parent' ||
			(req.user.role === 'leader' && req.user.activity === req.params.activity)
		) {
			// Find all members that belong to the requested activity
			const children = await Member.find({ activity: req.params.activity });

			if (children && children.length > 0) {
				return res.status(200).json({ success: true, data: children });
			} else {
				return next(
					new ErrorResponse(
						`There are no children signed up for ${req.params.activity}`,
						404
					)
				);
			}
		} else {
			return next(
				new ErrorResponse('Not authorized to access this route', 403)
			);
		}
	} catch (err) {
		return next(new ErrorResponse('Server Error', 500));
	}
});

//@desc     Update task
//@route    PUT /api/club/:id/photo
//@access   Private
exports.memberPhotoUpload = asyncHandler(async (req, res, next) => {
	upload.array('image')(req, res, async function (err) {
		if (err) {
			return next(new ErrorResponse('Error during image upload', 500));
		}

		try {
			const member = await Member.findById(req.params.id);
			if (!member) {
				return next(
					new ErrorResponse(`Task not found with id of ${req.params.id}`, 404)
				);
			}

			// Make sure user is task owner
			if (member.user.toString() !== req.user.id && req.user.role !== 'admin') {
				return next(
					new ErrorResponse(
						`User ${req.user.id} is not authorized to update this task`,
						401
					)
				);
			}

			if (!req.files) {
				return next(new ErrorResponse(`Please upload a file`, 400));
			}

			const file = req.files.file;

			// Make sure the image is a photo
			if (!file.mimetype.startsWith('image')) {
				return next(new ErrorResponse(`Please upload an image file`, 400));
			}
			//Check the file size
			if (file.size > parseInt(process.env.FILE_UPLOAD_LIMIT) * 1024 * 1024) {
				return next(
					new ErrorResponse(
						`File size exceeds the ${parseInt(
							process.env.FILE_UPLOAD_LIMIT
						)}MB limit`,
						400
					)
				);
			}
			console.log('Member:', member);
			console.log(req.body, req.file);
			res.send('Image uploaded successfully!');
		} catch (err) {
			console.error('Error during image upload:', err);
			return next(new ErrorResponse('Error during image upload', 500));
		}
	});
});
