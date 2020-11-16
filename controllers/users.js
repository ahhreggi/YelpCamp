// Require models
const User = require('../models/user');

// Render user register form
module.exports.renderRegister = (req, res) => {
    res.render('users/register');
};

// Create a new user using submitted data
module.exports.register = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        console.log(req.body);
        // Initialize new user properties
        const user = new User({ email, username });
        // Password + salt hashing managed by Passport.js
        const registeredUser = await User.register(user, password);
        // Log the user in upon registration
        req.login(registeredUser, err => {
            if (err) return next(err);
            // Flash success message and redirect
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        });
    } catch (e) {
        // If there is a problem during registration,
        // flash an error and redirect to form
        req.flash('error', e.message);
        res.redirect('/register');
    };
};

// Render user login page
module.exports.renderLogin = (req, res) => {
    res.render('users/login');
};

// Save session information upon successful login
module.exports.login = (req, res) => {
    // Flash success message and redirect
    req.flash('success', 'Welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    // Upon redirect, remove the URL reference
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

// Log user out
module.exports.logout = (req, res) => {
    req.logout(); // added by Passport.js
    // Flash success message and redirect
    req.flash('success', 'Goodbye!');
    res.redirect('/campgrounds');
};