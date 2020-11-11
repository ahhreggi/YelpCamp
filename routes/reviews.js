// Require modules
const express = require('express');
const router = express.Router({ mergeParams: true }); // merge parameters in app.js with routers
const catchAsync = require('../utils/catchAsync'); // async wrapper utility
const { reviewSchema } = require('../schemas.js');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const Review = require('../models/review');

// MIDDLEWARE: JOI Validation
// Server-side data validation functions are defined in schemas.js
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

// EDIT route - UPDATE existing data within the database
// (e.g., a page with a form that submits new data)
// Execute while validating data and catching any errors, and if so, pass to next() (the basic error handler)
router.post('/', validateReview, catchAsync(async (req, res) => {
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
router.delete('/:reviewId', catchAsync(async (req, res, next) => {
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

module.exports = router;