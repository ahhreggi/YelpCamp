// If the user is not logged in, redirect to the login page
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) { // .isAuthenticated() method is added by Passport
        // Store the URL that the user came from before being prompted to log in
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be logged in to do that.');
        return res.redirect('/login');
    }
    next();
}