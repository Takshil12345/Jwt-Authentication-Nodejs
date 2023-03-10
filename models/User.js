const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const userschema = new mongoose.Schema({
    email: {
        type: 'string',
        required: [true,"Please enter a valid email address"],
        unique: true,
        lowercase: true,
        validate: [isEmail,"Please enter a valid email"]
    },
    password: {
        type: 'string',
        required: [true,"Please enter a valid password"],
        minLength : [6,"Please enter a password of length 6 atleast"]
    },
});

userschema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, parseInt(salt));
    next();
})

userschema.statics.login = async (email, password) => {
    const user = await User.findOne({ email: email });
    if (user) {
        const auth = await bcrypt.compare(user.password, password);
        if (auth) {
            return user;
        }
        throw Error("Invalid password");
    } else {
        throw Error("Incorrect email");
    }
};

const User = mongoose.model('user', userschema);

module.exports = User;