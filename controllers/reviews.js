const Campground = require('../models/campground');
const Review = require('../models/review');
const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime);

// Create a new review using submitted data
module.exports.createReview = async (req, res) => {
    // Retrieve data for the campground being reviewed
    const campground = await Campground.findById(req.params.id);
    // Initialize and push new review properties
    const review = new Review(req.body.review);
    review.author = req.user._id;
    // Save current date and time
    review.date = dayjs().format('YYYY-MM-DD:HH:mm:ss')
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    // Flash success message and redirect
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
};

// Delete specified review
module.exports.deleteReview = async (req, res, next) => {
    const { id, reviewId } = req.params;
    // Retrieve data for the campground and remove the review
    // before deleting it entirely
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(req.params.reviewId);
    // Flash success message and redirect
    req.flash('success', 'Successfully deleted review!');
    res.redirect(`/campgrounds/${id}`);
};