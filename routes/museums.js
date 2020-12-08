const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const museums = require('../controllers/museums');
const { isLoggedIn, isAuthor, validateMuseum } = require('../middleware');
const multer = require('multer');
const { storage } = require('../config');
const upload = multer({ storage });

router.route('/')
    .get(wrapAsync(museums.index))
    .post(isLoggedIn, upload.array('image', 10), validateMuseum, wrapAsync(museums.createMuseum))

router.get('/new', isLoggedIn, museums.getNewForm);

router.route('/:id')
    .get(wrapAsync(museums.showMuseum))
    .put(isLoggedIn, isAuthor, validateMuseum, wrapAsync(museums.updateMuseum))
    .delete(isLoggedIn, isAuthor, wrapAsync(museums.deleteMuseum))

router.get('/:id/edit', isLoggedIn, isAuthor, wrapAsync(museums.getEditForm));

router.route('/:id/pictures')
    .get(isLoggedIn, isAuthor, wrapAsync(museums.getPictures))
    .post(isLoggedIn, isAuthor, upload.array('image'), wrapAsync(museums.managePictures))

module.exports = router;