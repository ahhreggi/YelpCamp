// Require models
const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

// Construct ImageSchema model
const ImageSchema = new Schema({
    url: String,
    filename: String
});

// Create a virtual thumbnail property for ImageSchemas
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

// Include virtuals when converting documents into JSON
const opts = { toJSON: { virtuals: true } };

// Construct Campground model
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
    date: String,
    updated: Boolean,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [ // an array of Review model objects
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

// Create a virtual popUpMarkup property for Campgrounds
CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>`
});

// When a Campground is deleted, findByIdAndDelete() triggers the
// findOneAndDelete() middleware to delete subsequent Reviews
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    // Delete all Review objects with an id found in the deleted
    // document's reviews property (array of ObjectIDs)
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

// Compile and export the model
module.exports = mongoose.model('Campground', CampgroundSchema);