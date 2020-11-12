// Require modules
const express = require('express');
const path = require('path')
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user')

// Routes
const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

// Check for database connection errors
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("(YelpCamp) Database connected")
})

// Create an Express application
const app = express();

// Set engine to parse EJS as ejsMate
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

// MIDDLEWARE: Session & Flash configuration
const sessionConfig = {
    secret: 'badsecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // + 7 days in milliseconds
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

// MIDDLEWARE: Enable persistent login sessions
app.use(passport.initialize());
app.use(passport.session());

// MIDDLEWARE: Authenticate user via passport and store/unstore User to the session
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// MIDDLEWARE: On every request, define local variables (ejs)
app.use((req, res, next) => {
    console.log(req.session);
    res.locals.currentUser = req.user; // info about the current user (User object if logged in, otherwise undefined), handled by Passport
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// MIDDLEWARE: Use routers
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use(`/campgrounds/:id/reviews`, reviewRoutes);

// Respond to a GET request for the home page
app.get('/', (req, res) => {
    res.render('home');
})

// Run if no other preceding requests are matched first (404: Not Found)
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

// Default error handler, receives an error, if any, from a previous function
app.use((err, req, res, next) => {
    // Deconstruct statusCode from previous function, with default set to 500
    const { statusCode = 500 } = err;
    // Set a default error message if none provided
    if (!err.message) err.message = 'Oh no, something went wrong!';
    // Send status code and render error.ejs page
    res.status(statusCode).render('error', { err });
})

// // Test the app's connection to the database (entry should be visible on MongoDB)
// app.get('/makecampground', async (req, res) => {
//     const camp = new Campground({ title: 'My Backyard', description: 'cheap camping' });
//     await camp.save()
//     res.send(camp)
// })

// Listen for connections on the specified port
app.listen(3000, () => {
    console.log('(YelpCamp) Listening to port 3000...');
})