// Run seperately to seed local database as needed

// Require modules
const mongoose = require('mongoose');
const cities = require('./cities'); // Sample data 1/2
const { places, descriptors } = require('./seedHelpers'); // Sample data 2/2
const Campground = require('../models/campground');
const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime);

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

// Delete everything and add new sample data
const seedDB = async () => {
    await Campground.deleteMany({});
    // Generate random values for the properties
    for (let i = 0; i < 400; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '5fb33beab5b37902522e694a', // Set to ObjectID of test user
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            date: dayjs().format('YYYY-MM-DD:HH:mm:ss'),
            updated: false,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
            price,
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
        // Save changes
        await camp.save();
    }
}
// Seed the database then close the connection
seedDB().then(() => {
    db.close();
    console.log('(YelpCamp - Seed) Seed successful');
    console.log('(YelpCamp - Seed) Disconnected from database');
})