// middleware/checkActivityAccess.js

const checkActivityAccess = (...activities) => {
	return (req, res, next) => {
	  const leaderRole = req.leader.role; // Get the role of the leader from the user object
  
	  // Check if the user is a leader and has access to any of the specified activities
	  if (leaderRole === 'leader' && activities.includes(leaderRole)) {
		next(); // Leader has access, proceed to the route handler
	  } else {
		// Leader does not have access to this activity, send a 403 Forbidden response
		return res.status(403).json({
		  success: false,
		  error: 'Access denied. You do not have permission for this activity.',
		});
	  }
	};
  };
  
  module.exports = checkActivityAccess;
  