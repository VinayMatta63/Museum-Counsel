const Museum = require('../models/Museum');
const { cloudinary } = require('../config');
const mapboxGeo = require("@mapbox/mapbox-sdk/services/geocoding");
const mapboxToken = process.env.MAPBOX_TOKEN;
const geoCoder = mapboxGeo({ accessToken: mapboxToken })
module.exports.index = async (req, res) => {
    const museums = await Museum.find({});
    res.render('museums/index.ejs', { museums });
};

module.exports.getNewForm = (req, res) => {
    res.render('museums/new.ejs');
};

module.exports.createMuseum = async (req, res) => {
    const geoData = await geoCoder.forwardGeocode({
        query: req.body.museum.location,
        limit: 1
    }).send()
    const museum = new Museum(req.body.museum);
    museum.geometry = geoData.body.features[0].geometry;
    console.log(req.files)
    museum.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    museum.author = req.user._id;
    await museum.save();
    req.flash('success', 'Successfully saved the museum!');
    res.redirect(`/museums/${museum._id}`);
};

module.exports.showMuseum = async (req, res) => {
    const museum = await Museum
        .findById(req.params.id)
        .populate({ path: 'reviews', populate: { path: 'author' } })
        .populate('author');

    if (!museum) {
        req.flash('error', 'Connot find the Museum');
        res.redirect('/museums');
    }
    res.render('museums/show.ejs', { museum });
};

module.exports.getEditForm = async (req, res) => {
    const museum = await Museum.findById(req.params.id);
    if (!museum) {
        req.flash('error', 'Connot find the Museum');
        res.redirect('/museums');
    }
    res.render('museums/edit.ejs', { museum });
};

module.exports.updateMuseum = async (req, res) => {
    const museum = await Museum.findByIdAndUpdate(req.params.id, { ...req.body.museum });
    req.flash('success', 'Successfully saved the museum!');
    res.redirect(`/museums/${museum._id}`);
};

module.exports.deleteMuseum = async (req, res) => {
    await Museum.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted the museum!');
    res.redirect('/museums');
};

module.exports.getPictures = async (req, res) => {
    const museum = await Museum
        .findById(req.params.id)
    res.render('museums/pictures.ejs', { museum });
};

module.exports.managePictures = async (req, res) => {
    const museum = await Museum
        .findById(req.params.id)
    const newImg = req.files.map(f => ({ url: f.path, filename: f.filename }))
    museum.images.push(...newImg);
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await museum.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    await museum.save();
    req.flash('success', 'Successfully saved the Pictures!');
    res.redirect(`/museums/${museum._id}`)
}