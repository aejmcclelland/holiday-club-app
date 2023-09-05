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
const { checkActivityAccess } = require('../middleware/yourMiddlewareFile');

router
	.route('/children')
	.get(
		protect,
		authorise('parent', 'grandparent', 'carer', 'admin'),
		checkActivityAccess('Sunday School', 'HBC', 'Connect', 'Senior Leader'),
		getChildren
	);

router
	.route('/')
	.get(
		protect,
		authorise('admin'),
		advancedResults(Member),
		checkActivityAccess('Sunday School', 'HBC', 'Connect', 'Senior Leader'),
		getMembers
	)
	.post(
		protect,
		authorise('parent', 'grandparent', 'carer', 'admin'),
		createMember
	);

router
	.route('/:id')
	.get(
		protect,
		authorise('parent', 'grandparent', 'carer', 'admin'),
		checkActivityAccess('Sunday School', 'HBC', 'Connect', 'Senior Leader'),
		getMember
	)
	.put(
		protect,
		checkActivityAccess('Sunday School', 'HBC', 'Connect', 'Senior Leader'),
		authorise('parent', 'grandparent', 'carer', 'admin'),
		updateMember
	)
	.delete(
		protect,
		authorise('parent', 'grandparent', 'carer', 'admin'),
		deleteMember
	);

module.exports = router;
