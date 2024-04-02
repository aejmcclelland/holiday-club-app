// Function to map selected role to 'family'
const mapRoleToFamily = (role) => {
	// If selected role is 'parent', 'carer', 'grandparent', or 'guardian', map it to 'family'
	if (['parent', 'carer', 'grandparent', 'guardian'].includes(role)) {
		return 'family';
	}
	// Otherwise, return the original role
	return role;
};

module.exports = mapRoleToFamily;
