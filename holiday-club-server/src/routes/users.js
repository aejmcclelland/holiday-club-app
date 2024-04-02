const express = require('express');

const {
	getAllUsers,
	getUser,
	updateUser,
	createUser,
	deleteUser,
} = require('../controllers/users');

const User = require('../models/User');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedresults');
const {
	protect,
	allowAccountCreation,
	authorise,
} = require('../middleware/auth');

router.post(
	'/',
	createUser,
	allowAccountCreation('parent', 'carer', 'guardian', 'grandparent')
);

router.use(protect);
router.use(authorise('admin'));

router
	.route('/')
	.get(advancedResults(User), getAllUsers)
	.post(
		createUser,
		allowAccountCreation('parent', 'carer', 'guardian', 'grandparent')
	);
router.route('/search').get(getUser);

router
	.route('/:id')
	.put(updateUser)
	.delete(protect, authorise('admin'), deleteUser);

module.exports = router;
