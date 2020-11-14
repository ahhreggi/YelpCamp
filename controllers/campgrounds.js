const Campground = require('../models/campground');

module.exports.index = async (req, res) => {
    // Retrieve data for all campgrounds
    const campgrounds = await Campground.find({});
    // Pass data into template and render
    res.render('campgrounds/index', { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
};

module.exports.createCampground = async (req, res, next) => {
    // Retrieve data submitted by the form (POST request)
    // MIDDLEWARE: req.body is parsed by app.use(express.urlencoded({ extended: true }))

    // If invalid data is submitted, throw an error 400 + message
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);

    // Create a new Campground model using the parsed data then save it
    const campground = new Campground(req.body.campground);
    // Save the campground author as the currently logged in user
    campground.author = req.user._id;
    await campground.save();
    // Flash success message
    req.flash('success', 'Successfully made a new campground!');
    // Redirect to the new campground's page
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
    // Retrieve data for the specified campground
    // Populate the reviews property (an array of Review objects)
    // Populate the author property of each review
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
    // Pass data into template and render
    res.render('campgrounds/show', { campground });
};

module.exports.renderEditForm = async (req, res) => {
    // Retrieve id parameter from the request
    const { id } = req.params;
    // Retrieve data for the specified campground
    const campground = await Campground.findById(id);
    // If the campground could not be found, flash error and redirect to campgrounds page
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    // Pass data into template and render
    res.render('campgrounds/edit', { campground });
};

module.exports.updateCampground = async (req, res) => {
    // Retrieve id parameter from the request
    const { id } = req.params;
    // MIDDLEWARE: req.body is parsed by app.use(express.urlencoded({ extended: true }))
    // Retrieve data for the specified campground and update it using the parsed data
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    // Flash success message
    req.flash('success', 'Successfully updated campground!');
    // Redirect to the campground's page
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
    // Retrieve id parameter from the request
    const { id } = req.params;
    // Retrieve data for the specified campground and delete it
    await Campground.findByIdAndDelete(id);
    // Flash success message
    req.flash('success', 'Successfully deleted campground!');
    // Redirect to the index page
    res.redirect('/campgrounds');
};