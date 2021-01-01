const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const users = require('../controllers/users')
const passport = require('passport');
const multer = require('multer');
const { storage } = require('../config');
const upload = multer({ storage });

router.route('/register')
    .get(users.getRegister)
    .post(upload.any('image'), wrapAsync(users.createUser))

router.route('/login')
    .get(users.getLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.loginUser)

router.get('/logout', users.logoutUser);

module.exports = router