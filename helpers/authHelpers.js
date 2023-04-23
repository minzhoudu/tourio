const { promisify } = require("util");
const jwt = require("jsonwebtoken");

exports.signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION,
    });
};

exports.checkToken = async (token) => {
    return await promisify(jwt.verify)(token, process.env.JWT_SECRET);
};

exports.sendJwtWithResponse = (user, statusCode, res) => {
    const token = exports.signToken(user._id);

    // httpOnly param protiv CSRF napada, secure param za https
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
        httpOnly: true,
    };
    if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

    // Remove the passwords from the json output
    user.password = undefined;

    res.cookie("jwt", token, cookieOptions);
    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user,
        },
    });
};
