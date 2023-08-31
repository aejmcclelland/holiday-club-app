const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const multer = require('multer');
const User = require('../models/User');
const { storage } = require('../cloudinary/index');
const upload = multer({ storage: storage });

//@desc     Create new task
//@route    POST /api/taskman
//@access   Private
exports.createPhoto = asyncHandler(async (req, res, next) => {
	//Add user to req.body
	req.body.user = req.user.id;

	const images = []; //store upload image URLs and filenames

	// Images have already been uploaded and processed by multer and multer-storage-cloudinary
	if (req.files) {
		for (const file of req.files) {
			images.push({
				url: file.secure_url,
				filename: file.originalname,
			});
		}
	}

	//Check for published task
	const publishedUser = await User.findOne({ user: req.user.id });

	//if the user is not the publisher, they cannot view
	if (publishedUser && req.user.role !== 'admin') {
		return next(
			new ErrorResponse(
				`The user with ID ${req.user.id} has already published this task`,
				400
			)
		);
	}
	const member = await Photo.create({ ...req.body, images: images });
	res.status(201).json({ success: true, data: member });
});
