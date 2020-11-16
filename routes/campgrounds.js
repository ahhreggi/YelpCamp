// Require modules
const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync'); // async wrapper utility
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.route('/')
    // INDEX route - READ and display all data from the database
    // (e.g., a page to display all campgrounds)
    // Execute while catching any errors, and if so, pass to next() (the basic error handler)
    .get(catchAsync(campgrounds.index))
    // NEW/CREATE route - CREATE new data and insert it into the database
    // (e.g., a page with a form that submits new data)
    // Require that the user is logged in (ideally, the user should never even make it to this form, but it's best to protect it anyways)
    // Execute while validating data and catching any errors, and if so, pass to next() (the basic error handler)
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))

// NEW/CREATE route - CREATE new data and insert it into the database
// (e.g., a page with a form that submits new data)
// NOTE: Order matters! This must precede the show route due to the url request
// Require that the user is logged in
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    // SHOW route - READ and display specific data from the database
    // (e.g., a page for a specific campground)
    // Execute while catching any errors, and if so, pass to next() (the basic error handler)
    .get(catchAsync(campgrounds.showCampground))
    // MIDDLEWARE: the edit form POST request is converted into PUT by app.use(methodOverride('_method'));
    // Require that the user is logged in
    // Check that the user is the author
    // Execute while validating data and catching any errors, and if so, pass to next() (the basic error handler)
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    // DELETE route - DESTROY existing data within the database
    // (e.g., a button on a campground page to delete it)
    // Require that the user is logged in
    // Check that the user is the author
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

// EDIT route - UPDATE existing data within the database
// (e.g., a page for modifying a specific campground)
// Require that the user is logged in
// Check that the user is the author
// Execute while catching any errors, and if so, pass to next() (the basic error handler)
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;