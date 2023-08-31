const express = require('express');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage: storage });

const {
	getPhoto,
	updatePhoto,
	deletePhoto,
	memberPhotoUpload,
} = require('../controllers/members');

const User = require('../models/User');

const router = express.Router();

//const advancedResults = require('../middleware/advancedresults');
const { protect, authorise } = require('../middleware/auth');

router
	.route('/:id/photo')
	.put(protect, authorise('admin'), memberPhotoUpload)
	.post(protect, authorise('admin'), memberPhotoUpload);

router.route('/').post(protect, authorise('admin'), upload.array('images'));

router
	.route('/:id')
	.get(getPhoto)
	.put(protect, authorise('admin'), updatePhoto)
	.delete(protect, authorise('admin'), deletePhoto);

module.exports = router;
