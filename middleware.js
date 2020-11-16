// Require modules
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

// If the user is not logged in, redirect to the login page
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) { // added by Passport.js
        // Store the URL that the user came from before being prompted to log in
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be logged in to do that.');
        return res.redirect('/login');
    }
    next();
}

// Validate user-submitted data for a new campground
module.exports.validateCampground = (req, res, next) => {
    // Validate submitted campground data
    const { error } = campgroundSchema.validate(req.body);
    // If there is an error, grab the details (array of objects),
    // map them into an array of its messages, join the messages,
    // then throw an ExpressError with the message and error code 400
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// Verify that the user is authorized to modify the campground
module.exports.isAuthor = async (req, res, next) => {
    // Retrieve data for the specified campground
    const campground = await Campground.findById(req.params.id);
    // If the user does not own the campground, flash error and redirect
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

// Verify that the user is authorized to modify the review
module.exports.isReviewAuthor = async (req, res, next) => {
    // Deconstruct parameters
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

// Validate user-submitted data for a new review
module.exports.validateReview = (req, res, next) => {
    // Validate submitted review data
    const { error } = reviewSchema.validate(req.body);
    // If there is an error, grab the details (array of objects),
    // map them into an array of its messages, join the messages,
    // then throw an ExpressError with the message and error code 400
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}