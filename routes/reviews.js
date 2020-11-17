// Require modules
const express = require('express');
const router = express.Router({ mergeParams: true }); // merge parameters in app.js with routers
const catchAsync = require('../utils/catchAsync'); // async wrapper utility
const { validateReview, isLoggedIn, isNotAuthor, isReviewAuthor } = require('../middleware');
const reviews = require('../controllers/reviews');

// CREATE route - Add new review to campground
router.post('/', isLoggedIn, isNotAuthor, validateReview, catchAsync(reviews.createReview));

// DELETE route - Delete a specific review from a campground
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

// Export routers
module.exports = router;