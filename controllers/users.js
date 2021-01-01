const User = require('../models/User');

module.exports.getRegister = (req, res) => {
    res.render('users/register')
};

module.exports.createUser = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        let image = req.files.map(f => ({ url: f.path, filename: f.filename }))[0]
        if (image === undefined) {
            url = "https://cdn.business2community.com/wp-content/uploads/2017/08/blank-profile-picture-973460_640.png"
            filename = "temp"
            image = { url, filename }
        }
        const user = new User({ email, username, image });
        const regUser = await User.register(user, password);
        req.login(regUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Museum Counsel!');
            res.redirect('/museums');
        })
    }
    catch (e) {
        req.flash('error', e.message);
        res.redirect('/register')
    }
};

module.exports.getLogin = (req, res) => {
    res.render('users/login');
};

module.exports.loginUser = (req, res) => {
    req.flash('success', 'Welcome Back!');
    const redirectUrl = req.session.returnTo || '/museums'
    delete req.session.returnTo
    res.redirect(redirectUrl);
};

module.exports.logoutUser = (req, res) => {
    req.logOut();
    req.flash('success', 'Successfully logged out!');
    res.redirect('/museums');
};