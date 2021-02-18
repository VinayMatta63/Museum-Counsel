const BaseJoi = require('joi')
const sanitizeHtml = require('sanitize-html')

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAtrributes: {},
                });
                if (clean !== value) return helpers.console.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
})
const Joi = BaseJoi.extend(extension)
module.exports.museumSchema = Joi.object({
    museum: Joi.object({
        title: Joi.string().required().escapeHTML(),
        ticket: Joi.number().required().min(0),
        images: Joi.array(),
        description: Joi.string().required().escapeHTML().max(400),
        location: Joi.string().required().escapeHTML()
    }).required(),
    deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
});