// Require models
const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require('../cloudinary');

// Render index page
module.exports.index = async (req, res) => {
    // Retrieve data for all campgrounds
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
};
// Render new campground form
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
};
// Create a new campground using submitted data
module.exports.createCampground = async (req, res, next) => {
    // Retrieve geodata obtained via mapbox
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    // Initialize new campground properties
    // Array of image files are added to req by multer
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({
        url: f.path, filename: f.filename
    }));
    // Save the campground author as the currently logged in user
    campground.author = req.user._id;
    // Save changes and flash success message
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
};

// Render specific campground page
module.exports.showCampground = async (req, res) => {
    // Retrieve data for the specified campground
    // Populate the reviews property (an array of Review objects)
    // and the subsequent author property of each review
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    // If the campground could not be found, flash error and redirect to campgrounds page
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
};

// Render edit campground form
module.exports.renderEditForm = async (req, res) => {
    // Retrieve data for the specified campground
    const campground = await Campground.findById(req.params.id);
    // If the campground could not be found, flash error and redirect to campgrounds page
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
};

// Update a campground using submitted data
module.exports.updateCampground = async (req, res) => {
    // Retrieve data for the specified campground and update
    const campground = await Campground.findByIdAndUpdate(
        req.params.id,
        { ...req.body.campground } // parsed by express.urlencoded()
    );
    // Add new images to existing images array
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    // If there are images to delete, pull from the images array
    // all filenames that are in the deleteImages array
    console.log('deleteImages: ', req.body.deleteImages);
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            // Delete the image from cloudinary
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    // Flash success message and redirect
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
};

// Delete specific campground
module.exports.deleteCampground = async (req, res) => {
    // Retrieve data for the specified campground and delete it
    await Campground.findByIdAndDelete(req.params.id);
    // Flash success message and redirect
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
};