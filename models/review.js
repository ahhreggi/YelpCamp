// Require models
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Construct Review model
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