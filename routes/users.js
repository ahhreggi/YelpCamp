// Require modules
const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const users = require('../controllers/users');

// NEW/CREATE route - CREATE new data and insert it into the database
// (e.g., a user registration page)
router.get('/register', users.renderRegister);
// Execute while validating data and catching any errors, and if so, pass to next() (the basic error handler)
router.post('/register', catchAsync(users.register));

// SHOW route - READ and display specific data from the database
// (e.g., a login page)
// Prompt the user to log in
router.get('/login', users.renderLogin);
// Authenticate user information and log in or alert issues accordingly
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login);

router.get('/logout', users.logout);

module.exports = router;