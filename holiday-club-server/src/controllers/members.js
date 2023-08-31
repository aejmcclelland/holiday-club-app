const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const slugify = require('slugify');
const multer = require('multer');
const Member = require('../models/Member');
const User = require('../models/User');

//@desc     Get all tasks
//@route    GET /api/taskman
//@access   Public
exports.getMembers = asyncHandler(async (req, res, next) => {
	res.status(200).json(res.advancedResults);
	console.log(req.body);
});

//@desc     Get one task
//@route    GET /api/taskman/:id
//@access   Public
exports.getMember = asyncHandler(async (req, res, next) => {
	const member = await Member.findById(req.params.id);

	if (member) {
		//Check if the requesting udser is the parent or carer
		if (
			member.user.toString() === req.user.id ||
			(member.carer && member.carer.toString() === req.user.id)
		) {
			// Check if the requesting user is an admin
			if (req.user.role === 'admin') {
				return res.status(200).json({ success: true, data: member });
			}
			// Check if the requesting user is the parent or carer of the child
			if (
				member &&
				(member.user.toString() === req.user.id ||
					member.carer.toString() === req.user.id)
			) {
				return res.status(200).json({ success: true, data: member });
			}
		} else {
			//User is not authorised to access this member's details
			return next(
				new ErrorResponse(
					`You are not authorised to access this member's details`,
					401
				)
			);
		}
	} else {
		// Member not found
		return next(
			new ErrorResponse('You are not authorized to access this member', 404)
		);
	}
});
//@desc     Create new task
//@route    GET /api/club/children
//@access   Private
exports.getChildren = asyncHandler(async (req, res, next) => {
	// Find all members that belong to the current user (parent)
	const children = await Member.find({ user: req.user.id });
	console.log('children', children);
	res.status(200).json({ success: true, data: children });
});

//@desc     Create new task
//@route    POST /api/taskman
//@access   Private
exports.createMember = asyncHandler(async (req, res, next) => {
	//Add user to req.body
	req.body.user = req.user.id;

	//Check for published task
	const publishedMember = await Member.findOne({ user: req.user.id });

	//if the user is not the publisher, they cannot view
	// if (publishedMember && req.user.role !== 'admin') {
	// 	return next(
	// 		new ErrorResponse(
	// 			`The user with ID ${req.user.id} has already added this child`,
	// 			400
	// 		)
	// 	);
	// }
	const member = await Member.create({ ...req.body });
	res.status(201).json({ success: true, data: member });
});

//@desc     Update task
//@route    PUT /api/taskman/:id
//@access   Private
exports.updateMember = asyncHandler(async (req, res, next) => {
	let member = await Member.findById(req.params.id);

	if (!member) {
		return next(
			new ErrorResponse(`Member not found with id of ${req.params.id}`, 404)
		);
	}
	// Check if the requesting user is an admin
	if (req.user.role === 'admin') {
		// Allow access for admin
		return res.status(200).json({ success: true, data: member });
	}

	// Check if the requesting user is the parent or carer of the child
	if (
		member &&
		(member.user.toString() === req.user.id ||
			member.carer.toString() === req.user.id)
	)
		if (member.user.toString() !== req.user.id && req.user.role !== 'admin') {
			//Make sure user is Task owner
			return next(
				new ErrorResponse(
					`User ${req.user.id} is not authorised to update this task`,
					401
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

//@desc     Delete task
//@route    DELETE /api/taskman/:id
//@access   Private
exports.deleteMember = asyncHandler(async (req, res, next) => {
	const member = await Member.findById(req.params.id);

	if (!member) {
		return next(
			new ErrorResponse(`Task not found with id of ${req.params.id}`, 404)
		);
	}

	//Make sure user is Task owner
	if (member.user.toString() !== req.user.id && req.user.role !== 'admin') {
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

//@desc     Update task
//@route    PUT /api/taskman/:id/photo
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
