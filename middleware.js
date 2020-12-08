const ExpressError = require('./utils/ExpressError')
const { museumSchema } = require('./schemas')
const { reviewSchema } = require('./schemas.js')
const Museum = require('./models/Museum');
const Review = require('./models/Review');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in');
        return res.redirect('/login');
    }
    next();
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const museum = await Museum.findById(id)
    if (!museum.author.equals(req.user._id)) {
        req.flash('error', 'You do not have the permission to do that!')
        return res.redirect(`/museum/${id}`)
    }
    next();
}

module.exports.validateMuseum = (req, res, next) => {
    const { error } = museumSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId)
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have the permission to do that!')
        return res.redirect(`/museum/${id}`)
    }
    next();
}