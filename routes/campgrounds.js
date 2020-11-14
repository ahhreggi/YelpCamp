// Require modules
const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync'); // async wrapper utility
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const Campground = require('../models/campground');

// INDEX route - READ and display all data from the database
// (e.g., a page to display all campgrounds)
// Execute while catching any errors, and if so, pass to next() (the basic error handler)
router.get('/', catchAsync(async (req, res) => {
    // Retrieve data for all campgrounds
    const campgrounds = await Campground.find({});
    // Pass data into template and render
    res.render('campgrounds/index', { campgrounds });
}))

// NEW/CREATE route - CREATE new data and insert it into the database
// (e.g., a page with a form that submits new data)
// NOTE: Order matters! This must precede the show route due to the url request
// Require that the user is logged in
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
})
// Require that the user is logged in (ideally, the user should never even make it to this form, but it's best to protect it anyways)
// Execute while validating data and catching any errors, and if so, pass to next() (the basic error handler)
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
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
}))

// SHOW route - READ and display specific data from the database
// (e.g., a page for a specific campground)
// Execute while catching any errors, and if so, pass to next() (the basic error handler)
router.get('/:id', catchAsync(async (req, res) => {
    // Retrieve data for the specified campground
    // Populate the reviews property (an array of Review objects)
    // Populate the author property of each review
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    console.log(campground);
    // If the campground could not be found, flash error and redirect to campgrounds page
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    // Pass data into template and render
    res.render('campgrounds/show', { campground });
}))

// EDIT route - UPDATE existing data within the database
// (e.g., a page for modifying a specific campground)
// Require that the user is logged in
// Check that the user is the author
// Execute while catching any errors, and if so, pass to next() (the basic error handler)
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
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
}))

// MIDDLEWARE: the edit form POST request is converted into PUT by app.use(methodOverride('_method'));
// Require that the user is logged in
// Check that the user is the author
// Execute while validating data and catching any errors, and if so, pass to next() (the basic error handler)
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
    // Retrieve id parameter from the request
    const { id } = req.params;
    // MIDDLEWARE: req.body is parsed by app.use(express.urlencoded({ extended: true }))
    // Retrieve data for the specified campground and update it using the parsed data
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    // Flash success message
    req.flash('success', 'Successfully updated campground!');
    // Redirect to the campground's page
    res.redirect(`/campgrounds/${campground._id}`);
}))

// DELETE route - DESTROY existing data within the database
// (e.g., a button on a campground page to delete it)
// Require that the user is logged in
// Check that the user is the author
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    // Retrieve id parameter from the request
    const { id } = req.params;
    // Retrieve data for the specified campground and delete it
    await Campground.findByIdAndDelete(id);
    // Flash success message
    req.flash('success', 'Successfully deleted campground!');
    // Redirect to the index page
    res.redirect('/campgrounds');
}))

module.exports = router;