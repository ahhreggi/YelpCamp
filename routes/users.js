// Require modules
const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const users = require('../controllers/users');

router.route('/register')
    // NEW route - Show form to register a new user
    .get(users.renderRegister)
    // CREATE route - Add new user to database then redirect
    .post(catchAsync(users.register))

router.route('/login')
    // Show form to authenticate existing users
    .get(users.renderLogin)
    // Authenticate user information or redirect on error
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

// Log user out
router.get('/logout', users.logout);

// Export routers
module.exports = router;