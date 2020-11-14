// Require modules
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

// If the user is not logged in, redirect to the login page
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) { // .isAuthenticated() method is added by Passport
        // Store the URL that the user came from before being prompted to log in
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be logged in to do that.');
        return res.redirect('/login');
    }
    next();
}

// MIDDLEWARE: JOI Validation
// Server-side data validation functions are defined in schemas.js
module.exports.validateCampground = (req, res, next) => {
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

// MIDDLEWARE: Verify author to check if the user has permission to modify the campground
module.exports.isAuthor = async (req, res, next) => {
    // Retrieve id parameter from the request
    const { id } = req.params;
    // Retrieve data for the specified campground
    const campground = await Campground.findById(id);
    // If the user does not own the campground, flash error and redirect
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

// MIDDLEWARE: Verify author to check if the user has permission to modify the review
module.exports.isReviewAuthor = async (req, res, next) => {
    // id = author of campground
    // reviewId = author of individual review
    // Retrieve id, reviewId parameters from the request
    const { id, reviewId } = req.params;
    // Retrieve data for the specified review
    const review = await Review.findById(reviewId);
    // If the user does not own the review, flash error and redirect
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

// MIDDLEWARE: JOI Validation
// Server-side data validation functions are defined in schemas.js
module.exports.validateReview = (req, res, next) => {
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