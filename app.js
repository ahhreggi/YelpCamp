// Import environment variables during development mode
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

// Require modules
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const MongoDBStore = require("connect-mongo")(session);

// Routes
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

// Connect to MongoDB
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

// Check for database connection
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log(`(YelpCamp) Database connected: ${db.host}`)
})

// Create an Express application
const app = express();

// Set ejsMate as EJS parser
app.engine('ejs', ejsMate);

// Change the default path for the views directory to the project directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// MIDDLEWARE: Parse the body of POST requests (CREATE route)
app.use(express.urlencoded({ extended: true }));

// MIDDLEWARE: Override convert form POST requests into PUT/DELETE
app.use(methodOverride('_method'));

// MIDDLEWARE: Serve public directory
app.use(express.static(path.join(__dirname, 'public')));

// MIDDLEWARE: Sanitize Mongo queries
app.use(mongoSanitize());

// Initialize MongoDB session store
const secret = process.env.SECRET || 'badsecret';
const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});
store.on("error", function(e) {
    console.log("SESSION STORE ERROR", e);
})

// MIDDLEWARE: Session & flash configuration
const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // + 7 days in milliseconds
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

// MIDDLEWARE: HTTP header setters
app.use(helmet());

// Restrict locations where resources can be fetched from
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/ahhreggi/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// MIDDLEWARE: Enable persistent login sessions
app.use(passport.initialize());
app.use(passport.session());

// MIDDLEWARE: Authenticate user via passport and store/unstore User to the session
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// MIDDLEWARE: On every request, define local ejs variables
app.use((req, res, next) => {
    res.locals.currentUser = req.user; // info about the current user (User object or undefined), handled by Passport
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// MIDDLEWARE: Use routers
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use(`/campgrounds/:id/reviews`, reviewRoutes);

// Render home page
app.get('/', (req, res) => {
    res.render('home');
})

// Run if no other preceding requests are matched first (404: Not Found)
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

// Default error handler (receives an error, if any, from a previous function)
app.use((err, req, res, next) => {
    // Deconstruct statusCode from previous function, with default set to 500
    const { statusCode = 500 } = err;
    // Set a default error message if none provided
    if (!err.message) err.message = 'Oh no, something went wrong!';
    // Send status code and render error page
    res.status(statusCode).render('error', { err });
})

// Initialize port to serve
const port = process.env.PORT || 3000;

// Listen for connections on the specified port
app.listen(port, () => {
    console.log(`(YelpCamp) Listening to port ${port}...`);
})