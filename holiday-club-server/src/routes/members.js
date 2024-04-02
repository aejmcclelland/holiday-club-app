const express = require('express');

const {
	getMembers,
	getMember,
	createMember,
	updateMember,
	deleteMember,
	getChildren,
	getChild,
	searchMemberByName,
} = require('../controllers/members');

const Member = require('../models/Member');

const router = express.Router();

const advancedResults = require('../middleware/advancedresults');
const { protect, authorise } = require('../middleware/auth');

router
	.route('/')
	.get(protect, authorise('admin'), advancedResults(Member), getMembers)
	.post(protect, authorise('family', 'admin'), createMember);

router
	.route('/:id')
	.get(protect, authorise('family', 'admin'), getMember)
	.put(protect, authorise('family', 'admin'), updateMember)
	.delete(protect, authorise('family', 'admin'), deleteMember);

router
	.route('/:activity/:id')
	.get(
		protect,
		authorise('family', 'admin', 'HBC', 'Sunday School', 'Connect'),
		getChild
	);
router
	.route('/:activity')
	.get(
		protect,
		authorise('admin', 'HBC', 'Sunday School', 'Connect'),
		getChildren
	);
router
	.route('/search')
	.get(protect, authorise('admin', 'family'), searchMemberByName);

module.exports = router;
