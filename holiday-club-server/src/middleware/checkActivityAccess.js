const Leader = require('../models/Leader');

const checkActivityAccess = (...activities) => {
	return async (req, res, next) => {
		try {
			const slug = req.params.slug; // Extract slug from the request
			// Find the leader by slug or another unique identifier
			const leader = await Leader.findOne({ slug });

			if (!leader) {
				return res.status(404).json({ message: 'Leader not found' });
			}

			// Check if the user is a leader and has access to any of the specified activities
			if (
				leader.role === 'leader' &&
				activities.some(activity => leader.activities.includes(activity))
			) {
				// The leader has access to at least one of the specified activities
				return next();
			}

			// If the leader doesn't have access to any of the activities, deny access
			return res.status(403).json({ message: 'Access denied' });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: 'Server error' });
		}
	};
};
