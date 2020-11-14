// Require modules
const express = require('express');
const router = express.Router({ mergeParams: true }); // merge parameters in app.js with routers
const catchAsync = require('../utils/catchAsync'); // async wrapper utility
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const Campground = require('../models/campground');
const Review = require('../models/review');
const reviews = require('../controllers/reviews');

// EDIT route - UPDATE existing data within the database
// (e.g., a page with a form that submits new data)
// Require that the user is logged in
// Execute while validating data and catching any errors, and if so, pass to next() (the basic error handler)
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

// DELETE route - DESTROY existing data within the database
// (e.g., a button on a campground's review to delete it)
// Require that the user is logged in
// Check that the user is the author
// Execute while validating data and catching any errors, and if so, pass to next() (the basic error handler)
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;