// Require models
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

// Construct User model
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
})

// Add a field for username + password to UserSchema via Passport.js
// Automatically ensures usernames are unique and provides additional methods
UserSchema.plugin(passportLocalMongoose);

// Compile and export the model
module.exports = mongoose.model('User', UserSchema);