const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

// Construct the basic schema model for a user
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
})
// Add a field for username + password to UserSchema
// Passport ensures that usernames are unique and provides additional methods
UserSchema.plugin(passportLocalMongoose);

// Compile and export the model
module.exports = mongoose.model('User', UserSchema);