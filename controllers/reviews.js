const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
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
};

module.exports.deleteReview = async (req, res, next) => {
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
};