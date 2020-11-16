const User = require('../models/user');
const passport = require('passport');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
};

module.exports.register = async (req, res) => {
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
    };
};

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
};

module.exports.login = (req, res) => {
    // Flash success message
    req.flash('success', 'Welcome back!');
    // Redirect to the previous page if it exists, otherwise redirect to the campgrounds page
    const redirectUrl = req.session.returnTo || '/campgrounds';
    // Upon redirect, remove the URL reference
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
    req.logout(); // .logout() is added by Passport
    req.flash('success', 'Goodbye!')
    res.redirect('/campgrounds');
};