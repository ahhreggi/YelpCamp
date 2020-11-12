// Require modules
const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const { nextTick } = require('process');

// NEW/CREATE route - CREATE new data and insert it into the database
// (e.g., a user registration page)
router.get('/register', (req, res) => {
    res.render('users/register');
});
// Execute while validating data and catching any errors, and if so, pass to next() (the basic error handler)
router.post('/register', catchAsync(async (req, res) => {
    try {
        const { email, username, password } = req.body;
        console.log(req.body);
        const user = new User({ email, username });
        // Passport handles the hashing of password + salt and stores it into the User object
        const registeredUser = await User.register(user, password); // (User object, password)
        // Log the user in upon registration
        req.login(registeredUser, err => {
            if (err) return next(err);
            // Flash success message
            req.flash('success', 'Welcome to Yelp Camp!');
            // Redirect to the new campground's page
            res.redirect('/campgrounds');
        });
    } catch (e) {
        // If there is a problem during registration, flash an error and redirect to form
        req.flash('error', e.message);
        res.redirect('/register');
    }
}));

// SHOW route - READ and display specific data from the database
// (e.g., a login page)
// Prompt the user to log in
router.get('/login', (req, res) => {
    res.render('users/login');
});
// Authenticate user information and log in or alert issues accordingly
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    // Flash success message
    req.flash('success', 'Welcome back!');
    // Redirect to the previous page if it exists, otherwise redirect to the campgrounds page
    const redirectUrl = req.session.returnTo || '/campgrounds';
    // Upon redirect, remove the URL reference
    delete req.session.returnTo;
    res.redirect(redirectUrl);
});

router.get('/logout', (req, res) => {
    req.logout(); // .logout() is added by Passport
    req.flash('success', 'Goodbye!')
    res.redirect('/campgrounds');
})

module.exports = router;