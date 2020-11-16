// Require modules
const express = require('express');
const router = express.Router({ mergeParams: true }); // merge parameters in app.js with routers
const catchAsync = require('../utils/catchAsync'); // async wrapper utility
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const Campground = require('../models/campground');
const Review = require('../models/review');
const reviews = require('../controllers/reviews');

// CREATE route - Add new review to campground
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

// DELETE route - Delete a specific review from a campground
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

// Export routers
module.exports = router;