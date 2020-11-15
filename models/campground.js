// Require models
const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({

    url: String,
    filename: String

});

// Create a virtual thumbnail property
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

// Include virtuals when converting documents into JSON
const opts = { toJSON: { virtuals: true } };

// Construct the basic schema model for a campground
// reviews is an array of Review model objects
const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
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
}, opts)

// Create a virtual popUpMarkup property
CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>`
});

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