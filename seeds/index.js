const mongoose = require('mongoose');
const cities = require('./cities');
const { descriptors, synons } = require('./seedHelpers')
const Museum = require('../models/Museum');

mongoose.connect('mongodb+srv://vin-mat_33:U4SnCqj0ZhfW1UU9@cluster0.7wpif.mongodb.net/<dbname>?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database Connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];
const seedDB = async () => {
    await Museum.deleteMany({});
    for (let i = 0; i < 10; i++) {
        const ran = Math.floor(Math.random() * 150);
        const price = Math.floor(Math.random() * 100) + 10;
        const museum = new Museum({
            location: `${cities[ran].city}, ${cities[ran].admin_name}`,
            title: `${sample(descriptors)} ${sample(synons)}`,
            geometry: {
                type: "Point",
                coordinates: [cities[ran].lng, cities[ran].lat]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dpnapmmwm/image/upload/v1606660236/Museum%20Councel/h1uq1d3i8adolkz9hpl1.jpg',
                    filename: 'Museum Councel/h1uq1d3i8adolkz9hpl1'
                },
                {
                    url: 'https://res.cloudinary.com/dpnapmmwm/image/upload/v1606660206/Museum%20Councel/cg1jsh4lkgsx3bri8o8a.jpg',
                    filename: 'Museum Councel/cg1jsh4lkgsx3bri8o8a'
                }
            ],
            description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Fuga accusamus excepturi nesciunt, officiis porro beatae placeat iste quidem eligendi dolore! Repellendus fugit recusandae aut necessitatibus illo deleniti, architecto maxime ex',
            ticket: price,
            author: "5fede469771722022891f2a8"
        });
        await museum.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})
