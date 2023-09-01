const express = require('express');

const {
	getMembers,
	getMember,
	createMember,
	updateMember,
	deleteMember,
	getChildren,
} = require('../controllers/members');

const Member = require('../models/Member');

const router = express.Router();

const advancedResults = require('../middleware/advancedresults');
const { protect, authorise } = require('../middleware/auth');

router
	.route('/children')
	.get(
		protect,
		authorise('parent', 'grandparent', 'carer', 'admin'),
		getChildren
	);

router
	.route('/')
	.get(protect, authorise('admin'), advancedResults(Member), getMembers)
	.post(
		protect,
		authorise('parent', 'grandparent', 'carer', 'admin'),
		createMember
	);

router
	.route('/:id')
	.get(protect, authorise('parent', 'grandparent', 'carer', 'admin'), getMember)
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
