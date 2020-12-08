const mongoose = require('mongoose');
const Review = require('./Review');
const User = require('./User');
const Schema = mongoose.Schema;

const MuseumSchema = new Schema({
    title: String,
    images: [
        {
            url: String,
            filename: String
        }
    ],
    ticket: Number,
    description: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, { toJSON: { virtuals: true } });

MuseumSchema.virtual('properties.popUpMarkup').get(function () {
    return `<strong><a href="/museums/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>`
})

MuseumSchema.post('findOneAndDelete', async function (museum) {
    if (museum) {
        await Review.deleteMany({
            _id: {
                $in: museum.reviews
            }
        })
    }
})

module.exports = mongoose.model('Museum', MuseumSchema);