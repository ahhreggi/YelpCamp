// Require modules
const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync'); // async wrapper utility
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

// Routes check for user authentication and authorization,
// validate user-submitted data, and catch potential errors

router.route('/')
    // INDEX route - Display all campgrounds
    .get(catchAsync(campgrounds.index))
    // CREATE route - Add new campground to database then redirect
    .post(isLoggedIn,
        upload.array('image'),
        validateCampground,
        catchAsync(campgrounds.createCampground))

// NEW route - Show form to submit a new campground
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    // SHOW route - Show info for one campground
    .get(catchAsync(campgrounds.showCampground))
    // UPDATE route - Update an existing campground then redirect
    .put(isLoggedIn,
        isAuthor,
        upload.array('image'),
        validateCampground,
        catchAsync(campgrounds.updateCampground))
    // DELETE route - Delete a specific campground then redirect
    .delete(isLoggedIn,
        isAuthor,
        catchAsync(campgrounds.deleteCampground))

// EDIT route - Show form to edit an existing campground
router.get('/:id/edit',
    isLoggedIn,
    isAuthor,
    catchAsync(campgrounds.renderEditForm));

// Export routers
module.exports = router;