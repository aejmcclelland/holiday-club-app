const express = require('express');

const {
	getMembers,
	getMember,
	createMember,
	updateMember,
	deleteMember,
	getChildren,
	getChild,
} = require('../controllers/members');

const Member = require('../models/Member');

const router = express.Router();

const advancedResults = require('../middleware/advancedresults');
const { protect, authorise } = require('../middleware/auth');

router
	.route('/')
	.get(protect, authorise('admin'), advancedResults(Member), getMembers)
	.post(protect, authorise('parent', 'admin'), createMember);

router
	.route('/:id')
	.get(protect, authorise('parent', 'admin'), getMember)
	.put(protect, authorise('parent', 'admin'), updateMember)
	.delete(protect, authorise('parent', 'admin'), deleteMember);

router
	.route('/:activity/:id')
	.get(
		protect,
		authorise('parent', 'admin', 'HBC', 'Sunday School', 'Connect'),
		getChild
	);
router
	.route('/:activity')
	.get(
		protect,
		authorise('admin', 'HBC', 'Sunday School', 'Connect'),
		getChildren
	);

module.exports = router;
