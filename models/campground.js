// Require models
const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

// Construct the basic schema model for a campground
// reviews is an array of Review model objects
const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
})

// When a Campground is deleted, findByIdAndDelete() is executed (app.js)
// findByIdAndDelete() uses the findOneAndDelete() middleware
// After a Campground is deleted (hence, post), this returns the deleted document (doc) which can then be used to delete subsequent Reviews in reviews
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    // If a document was found and deleted
    if (doc) {
        // Delete all Review objects with an id found in the deleted document's reviews (array of ObjectIDs)
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

// Compile and export the model
module.exports = mongoose.model('Campground', CampgroundSchema);