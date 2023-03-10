const User = require('../models/User');
const jwt = require('jsonwebtoken');

const handleError = (err) => {

    const error = { email: "", password: "" };

    // incorrect email
    if (err.message === "Incorrect email") {
        error.email = "Email is invalid";
    }

    // invalid password
    if (err.message === "Invalid password") { 
        error.password = "Password is invalid";
    }

    // duplicate email error
    if (err.code === 11000) {
        error['email'] = "Email already exists";
        return error;
    }

    // validating errors
    if (err.message.includes("user validation failed")) {
        Object.values(err.errors).forEach((x) => {
            error[x.properties.path]=x.properties.message;
        })
    }

    return error;
}

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, 'Chingam Secret', {
        expiresIn: maxAge
    })
};

const get_signup = (req, res) => {
    res.render("signup");
}

const get_login = (req, res) => {
  res.render('login');
};

const post_signup = async(req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.create({ email: email, password: password });
        const token = createToken(user._id);
        res.cookie('jwt', token, { maxAge: maxAge*1000 , httpOnly: true });
        res.status(201).json({user});
    } catch (err) {
        const errors = handleError(err);
        res.status(400).json({ errors });
    }

};

const post_login = async(req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, { maxAge: maxAge * 1000, httpOnly: true });
        res.status(201).json({ user });
    } catch (error) {
        const errors = handleError(error);
        res.status(400).json({errors});
    }
};

const get_logout = (req, res) => {
    res.cookie('jwt', "", { maxAge: 1 });
    res.redirect('/');
}

module.exports = { get_signup, get_login, post_signup, post_login , get_logout };