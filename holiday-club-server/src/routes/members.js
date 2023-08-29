const express = require('express');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage: storage });

const {
	getMembers,
	getMember,
	createMember,
	updateMember,
	deleteMember,
	memberPhotoUpload,
} = require('../controllers/members');

const Member = require('../models/Member');

const router = express.Router();

const advancedResults = require('../middleware/advancedresults');
const { protect, authorise } = require('../middleware/auth');

router
	.route('/:id/photo')
	.put(protect, authorise('admin'), memberPhotoUpload)
	.post(protect, authorise('admin'), memberPhotoUpload);

router
	.route('/')
	.get(advancedResults(Member), getMembers)
	.post(
		protect,
		authorise('parent', 'grandparent', 'carer', 'admin'),
		upload.array('images'),
		createMember
	);

router
	.route('/:id')
	.get(getMember)
	.put(
		protect,
		authorise('parent', 'grandparent', 'carer', 'admin'),
		updateMember
	)
	.delete(
		protect,
		authorise('parent', 'grandparent', 'carer', 'admin'),
		deleteMember
	);

module.exports = router;
