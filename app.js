// Require modules
const express = require('express');
const path = require('path')
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
// const Joi = require('joi') // data validator, moved to schemas.js
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const catchAsync = require('./utils/catchAsync'); // async wrapper utility
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const Review = require('./models/review');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
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

// MIDDLEWARE: JOI Validation
// Server-side data validation functions are defined in schemas.js
const validateCampground = (req, res, next) => {
    // Validate the body (JOI) and grab the error if there is one
    const { error } = campgroundSchema.validate(req.body);
    // If there is an error, grab the details (array of objects)
    // Map the details into an array of its messages, then join the messages together with the delimiter ,
    // Throw an ExpressError with the message and send error code 400
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}
const validateReview = (req, res, next) => {
    // Validate the body (JOI) and grab the error if there is one
    const { error } = reviewSchema.validate(req.body);
    // If there is an error, grab the details (array of objects)
    // Map the details into an array of its messages, then join the messages together with the delimiter ,
    // Throw an ExpressError with the message and send error code 400
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// Respond to a GET request for the home page
app.get('/', (req, res) => {
    res.render('home');
})

// INDEX route - READ and display all data from the database
// (e.g., a page to display all campgrounds)
// Execute while catching any errors, and if so, pass to next() (the basic error handler)
app.get('/campgrounds', catchAsync(async (req, res) => {
    // Retrieve data for all campgrounds
    const campgrounds = await Campground.find({});
    // Pass data into template and render
    res.render('campgrounds/index', { campgrounds });
}))

// NEW/CREATE route - CREATE new data and insert it into the database
// (e.g., a page with a form that submits new data)
// NOTE: Order matters! This must precede the show route due to the url request
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})
// Execute while validating data and catching any errors, and if so, pass to next() (the basic error handler)
app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    // Retrieve data submitted by the form (POST request)
    // MIDDLEWARE: req.body is parsed by app.use(express.urlencoded({ extended: true }))

    // If invalid data is submitted, throw an error 400 + message
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);

    // Create a new Campground model using the parsed data then save it
    const campground = new Campground(req.body.campground);
    await campground.save();
    // Redirect to the new campground's page
    res.redirect(`/campgrounds/${campground._id}`);
}))

// SHOW route - READ and display specific data from the database
// (e.g., a page for a specific campground)
// Execute while catching any errors, and if so, pass to next() (the basic error handler)
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    // Retrieve id parameter from the request
    const { id } = req.params;
    // Retrieve data for the specified campground
    // Populate the reviews property (an array of Review objects)
    const campground = await Campground.findById(id).populate('reviews');
    console.log(campground);
    // Pass data into template and render
    res.render('campgrounds/show', { id, campground });
}))

// EDIT route - UPDATE existing data within the database
// (e.g., a page for modifying a specific campground)
// Execute while catching any errors, and if so, pass to next() (the basic error handler)
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    // Retrieve id parameter from the request
    const { id } = req.params;
    // Retrieve data for the specified campground
    const campground = await Campground.findById(id);
    // Pass data into template and render
    res.render('campgrounds/edit', { campground });
}))
// MIDDLEWARE: the edit form POST request is converted into PUT by app.use(methodOverride('_method'));
// Execute while validating data and catching any errors, and if so, pass to next() (the basic error handler)
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    // Retrieve id parameter from the request
    const { id } = req.params;
    // MIDDLEWARE: req.body is parsed by app.use(express.urlencoded({ extended: true }))
    // Retrieve data for the specified campground and update it using the parsed data
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    // Redirect to the campground's page
    res.redirect(`/campgrounds/${campground._id}`);
}))

// DELETE route - DESTROY existing data within the database
// (e.g., a button on a campground page to delete it)
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    // Retrieve id parameter from the request
    const { id } = req.params;
    // Retrieve data for the specified campground and delete it
    await Campground.findByIdAndDelete(id);
    // Redirect to the index page
    res.redirect('/campgrounds');
}))

// EDIT route - UPDATE existing data within the database
// (e.g., a page with a form that submits new data)
// Execute while validating data and catching any errors, and if so, pass to next() (the basic error handler)
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    // Retrieve data for the specified campground
    const campground = await Campground.findById(req.params.id);
    // Create a new Review model using the parsed data
    const review = new Review(req.body.review);
    // Add the review to the campground
    campground.reviews.push(review);
    // Save the review and campground
    await review.save();
    await campground.save();
    // Redirect to the campground's page
    res.redirect(`/campgrounds/${campground._id}`);
}))

// DELETE route - DESTROY existing data within the database
// (e.g., a button on a campground's review to delete it)
// Execute while validating data and catching any errors, and if so, pass to next() (the basic error handler)
app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res, next) => {
    const { id, reviewId } = req.params;
    // Retrieve data for the specified campground
    // reviews is an array of ObjectIDs
    // Use $pull to remove any object that matches reviewId
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    // Retrieve data for the specified review and delete it
    await Review.findByIdAndDelete(req.params.reviewId);
    // Redirect to the campground's page
    res.redirect(`/campgrounds/${id}`);
}))

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