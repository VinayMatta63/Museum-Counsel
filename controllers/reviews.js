const Review = require('../models/Review')
const Museum = require('../models/Museum');

module.exports.createReview = async (req, res) => {
    const museum = await Museum.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    museum.reviews.push(review);
    await review.save();
    await museum.save();
    req.flash('success', 'Review added!');
    res.redirect(`/museums/${museum._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Museum.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findById(req.params.reviewId);
    req.flash('success', 'Review deleted!');
    res.redirect(`/museums/${id}`);
}