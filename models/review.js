// Require models
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Construct the basic schema model for a review
const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

// Compile and export the model
module.exports = mongoose.model('Review', reviewSchema);