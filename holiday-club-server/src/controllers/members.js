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
		req.user.role === 'family' ||
		req.user.id === member.user.toString() ||
		(member.carer && req.user.id === member.carer.toString())
	) {
		return res.status(200).json({ success: true, data: member });
	}

	return next(new ErrorResponse('Not authorized to access this member', 403));
});

//@desc     Create new children
//@route    POST /api/club
//@access   Private/Parent
exports.createMember = asyncHandler(async (req, res, next) => {
	// Check if the user is a family member
	if (req.user.role !== 'family') {
		// Allow only family members to create new children
		return next(new ErrorResponse('Not authorized to create a member', 403));
	}

	// Add the logged-in user's ID to the member data
	req.body.user = req.user.id;

	// If an admin is creating the member and wants to link it to a user
	if (req.user.role === 'admin' && req.body.userId) {
		// Validate if the specified user exists
		const existingUser = await User.findById(req.body.userId);
		if (!existingUser) {
			return next(new ErrorResponse('Specified user not found', 404));
		}
		// Add the specified user's ID to the member data
		req.body.user = req.body.userId;
	}

	// Create the member
	const member = await Member.create(req.body);

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
	const { firstname, surname } = req.params;

	// Find the member by first name and surname
	const member = await Member.findOne({ firstname, surname });

	if (!member) {
		return next(
			new ErrorResponse(`Member not found with id of ${req.params.id}`, 404)
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
				`User ${req.user.id} is not authorised to delete this member`,
				401
			)
		);
	}

	await member.deleteOne();

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
		req.user.role === 'family' ||
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
			req.user.role === 'family' ||
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

//@desc     Search for a member by name
//@route    GET /api/club/search?firstname=:firstname&surname=:surname
//@access   Private (admin or family)
exports.searchMemberByName = asyncHandler(async (req, res, next) => {
	const { firstname, surname } = req.query;
	const searchSlug = slugify(`${firstname} ${surname}`, { lower: true });

	// Perform search based on first name and surname
	const members = await Member.find({ slug: searchSlug });

	if (!members || members.length === 0) {
		return next(
			new ErrorResponse(
				`No member found with the name ${firstname} ${surname}`,
				404
			)
		);
	}

	// Check authorization
	const authorisedMembers = members.filter((member) => {
		// Check if user is admin or family
		if (req.user.role === 'admin' || req.user.role === 'family') {
			return true;
		}
		// Check if user is parent of the member
		return req.user.id === member.user.toString();
	});

	if (authorisedMembers.length === 0) {
		return next(
			new ErrorResponse(
				'Not authorized to access any members with the given name',
				403
			)
		);
	}

	res.status(200).json({ success: true, data: authorisedMembers });
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
