const mongoose = require('mongoose');

// MongoDB URI from environment variables
const uri = process.env.MONGO_URI;

const connectDB = async () => {
	try {
		// Connect to MongoDB
		const conn = await mongoose.connect(uri);

		// Log connection success
		console.log(`MongoDB Connected: ${conn.connection.host}`.magenta.inverse);

		// Optionally log connection state
		console.log(`Connection Ready State: ${mongoose.connection.readyState}`);
	} catch (error) {
		// Log error and exit process
		console.error(`Error: ${error.message}`.red.inverse);
		process.exit(1);
	}
};

module.exports = connectDB;
