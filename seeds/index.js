// This will be run seperately whenever we want to seed our database

// Require modules
const mongoose = require('mongoose');
const cities = require('./cities'); // Sample data file #1
const { places, descriptors } = require('./seedHelpers'); // Sample data file #2
const Campground = require('../models/campground');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})

// Check for database connection errors
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("(YelpCamp - Seed) Database connected");
})

// A function to select a random element from an array
const sample = (array) => array[Math.floor(Math.random() * array.length)];

// Delete everything and add 50 new sample data
const seedDB = async () => {
    await Campground.deleteMany({});
    //// Generate one sample to test the database connection
    // const c = new Campground({ title: 'purple field' });
    // await c.save();
    ////////////////////////////////////////////////////////////
    // Create a new sample campground 50 times
    // Generate random values for the properties
    for (let i = 0; i < 400; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '5facde5049a505023528341e', // Set to ObjectID of user = ahhreggi
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
            price, // automatically defaults to { price: price }
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/ahhreggi/image/upload/v1605414440/YelpCamp/wu9zogxzo6s5j96hazgj.jpg',
                    filename: 'YelpCamp/wu9zogxzo6s5j96hazgj'
                },
                {
                    url: 'https://res.cloudinary.com/ahhreggi/image/upload/v1605414441/YelpCamp/tqe2m22iyrzqonngxxqm.jpg',
                    filename: 'YelpCamp/tqe2m22iyrzqonngxxqm'
                }
            ]
        });
        // Save the changes
        await camp.save();
    }
}
// Seed the database then close the connection
seedDB().then(() => {
    db.close();
    console.log('(YelpCamp - Seed) Seed successful');
    console.log('(YelpCamp - Seed) Disconnected from database');
})