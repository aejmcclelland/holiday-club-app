const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileupload = require('express-fileupload');
const mongoSanitize = require('express-mongo-sanitize');
const errorHandler = require('./src/middleware/error');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const helmet = require('helmet');
const { xss } = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
//Load env variables
dotenv.config({ path: '../holiday-club-server/.env' });

const connectDB = require('./src/config/db');
//connect to the database
connectDB();

//Connect to database
const dbUrl = process.env.MONGO_URI;
const app = express();

//use CORS middleware
// Allow requests from localhost:3001 (your React app's development server)
app.use(
	cors({
		origin: 'http://localhost:3001',
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	})
);
//Development logging middleware
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

// Allow requests from your frontend domain
// const allowedOrigins = ['https://your-frontend-domain.com', 'http://localhost:3001']; // Add your frontend domain(s)

// const corsOptions = {
//   origin: function (origin, callback) {
//     if (allowedOrigins.includes(origin) || !origin) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
// };
//app.use(cors(corsOptions));

const storeConfig = {
	mongoUrl: dbUrl, //connect to MongoDB for session storage
	touchAfter: 24 * 3600, // time period in seconds
};

const sessionConfig = {
	secret: 'thisshouldbeabettersecret!', //secret used to sign the session ID cookie
	resave: false, //optimise performance by only saving the session when changes have been made
	saveUninitialized: true, //determin if save session on every request
	store: MongoStore.create(storeConfig), //connect to MongoStore
	cookie: {
		//define cookie settings
		httpOnly: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //session cookie expires in 7 days
		maxAge: 1000 * 60 * 60 * 24 * 7, //maximum age of session cookie 7 days
	},
};

app.use(session(sessionConfig));
//Body parser
app.use(express.json());
//Cookie parser
app.use(cookieParser());
// Sanatise data
app.use(mongoSanitize());
// Set secure headers
app.use(helmet());
//Prevent cross site scripting
app.use(xss());
//Rate limit
const limiter = rateLimit({
	windowMs: 10 * 60 * 1000, //10 minutes
	max: 100,
	standardHeaders: true,
});

app.use(limiter);
//Prevent http param pollution
app.use(hpp());
//Limit file upload size
app.use(
	fileupload({
		limits: { fileSize: parseInt(process.env.FILE_UPLOAD_LIMIT) },
	})
);
//Route files
const members = require('./src/routes/members');
const auth = require('./src/routes/auth');
const users = require('./src/routes/users');

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/club', members);
app.use('/api/auth', auth); //mount routers
app.use('/api/users', users); //mount routers

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
	console.log(
		`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
	);
});

//Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
	console.log(`Error: ${err.message}`);
	//Close server & exit process
	server.close(() => process.exit(1));
});
