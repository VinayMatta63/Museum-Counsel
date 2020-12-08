const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const users = require('../controllers/users')
const passport = require('passport');

router.route('/register')
    .get(users.getRegister)
    .post(wrapAsync(users.createUser))

router.route('/login')
    .get(users.getLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.loginUser)

router.get('/logout', users.logoutUser);

module.exports = router