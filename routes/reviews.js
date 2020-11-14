// Require modules
const express = require('express');
const router = express.Router({ mergeParams: true }); // merge parameters in app.js with routers
const catchAsync = require('../utils/catchAsync'); // async wrapper utility
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const Campground = require('../models/campground');
const Review = require('../models/review');

// EDIT route - UPDATE existing data within the database
// (e.g., a page with a form that submits new data)
// Require that the user is logged in
// Execute while validating data and catching any errors, and if so, pass to next() (the basic error handler)
router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    // Retrieve data for the specified campground
    const campground = await Campground.findById(req.params.id);
    // Create a new Review model using the parsed data
    const review = new Review(req.body.review);
    // Save the review author as the currently logged in user
    review.author = req.user._id;
    // Add the review to the campground
    campground.reviews.push(review);
    // Save the review and campground
    await review.save();
    await campground.save();
    // Flash success message
    req.flash('success', 'Created new review!');
    // Redirect to the campground's page
    res.redirect(`/campgrounds/${campground._id}`);
}))

// DELETE route - DESTROY existing data within the database
// (e.g., a button on a campground's review to delete it)
// Require that the user is logged in
// Check that the user is the author
// Execute while validating data and catching any errors, and if so, pass to next() (the basic error handler)
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res, next) => {
    const { id, reviewId } = req.params;
    // Retrieve data for the specified campground
    // reviews is an array of ObjectIDs
    // Use $pull to remove any object that matches reviewId
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    // Retrieve data for the specified review and delete it
    await Review.findByIdAndDelete(req.params.reviewId);
    // Flash success message
    req.flash('success', 'Successfully deleted review!');
    // Redirect to the campground's page
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;