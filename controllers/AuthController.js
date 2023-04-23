// const bcrypt = require("bcrypt");
const crypto = require("crypto");

const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Email = require("../utils/email");
const { checkToken, sendJwtWithResponse } = require("../helpers/authHelpers");

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    });

    const url = `${req.protocol}://${req.get("host")}/account`;

    await new Email(newUser, url).sendWelcome();
    sendJwtWithResponse(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    //check if email and password exist
    if (!email || !password) return next(new AppError("Please provide email and password", 400));

    //check if the user exists && password is correct
    const user = await User.findOne({ email }).select("+password");
    if (!user) return next(new AppError("Incorrect email or password", 401));

    const passwordOk = await user.passwordOk(password, user.password);
    if (!passwordOk) return next(new AppError("Incorrect email or password"), 401);

    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // send token to the client
    sendJwtWithResponse(user, 200, res);
});

exports.logout = (_, res) => {
    res.cookie("jwt", "loggedout", {
        expires: new Date(Date.now() + 5 * 1000),
        httpOnly: true,
    });

    res.status(200).json({ status: "success" });
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1. get user based on req.body.email
    const user = await User.findOne({ email: req.body.email });
    if (!user) return next(new AppError("No such user with the given email address", 404));

    // 2. generate the random reset token
    const resetToken = user.generatePasswordResetToken();

    // 3. send it back as an email
    try {
        const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;
        await new Email(user, resetURL).sendPasswordReset();

        res.status(200).json({
            status: "success",
            message: "Token sent to email",
        });
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new AppError("There was an error sending the email, please try again later!", 500));
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1. get token from the params and check if it exists
    const { token } = req.params;
    if (!token) return next(new AppError("Reset token missing", 401));

    // 2. get user based on the token
    const hashToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({ passwordResetToken: hashToken, passwordResetExpires: { $gt: Date.now() } });
    if (!user) return next(new AppError("Token is invalid or has already expired", 400));

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // 3. update the passwordChangedAt property for the user
    // updated in the userModel pre-save middleware only if the document is not newly created, but updated

    // 4. log in the user, send JWT
    sendJwtWithResponse(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1. get the current user
    const user = await User.findById(req.user.id).select("+password");
    if (!user) return next(new AppError("The user does not exist"), 404);

    // 2. check if the posted currentPassword is correct
    const isPasswordCorrect = await user.passwordOk(req.body.currentPassword, user.password);
    if (!isPasswordCorrect) return next(new AppError("Your current password is wrong"), 401);

    // 3. is so, update the password with the newPassword
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    //?didn't use user.findOneAndUpdate because the validation it he userModel woultn't work (This keyword wouldn't point to the user document)

    // 4. login user, send JWT
    sendJwtWithResponse(user, 200, res);
});

//Prevents user to access the page when not logged in
exports.isAuthenticated = catchAsync(async (req, res, next) => {
    // 1. Get and check the token
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
        // return next();
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) return next(new AppError("You are not logged in! Please log in to get access", 401));

    // 2.Validate(verify) Token
    const decodedToken = await checkToken(token);

    // 3. Check if user exists
    const user = await User.findById(decodedToken.id).select("+role");
    if (!user) return next(new AppError("This token's bearer no longer exists", 401));

    // 4. Check if user changed pass after the JWT was issued
    if (user.passwordChangedAfterJWT(decodedToken.iat)) {
        return next(new AppError("User has changed the password recently. Please login again."), 401);
    }

    req.user = user;
    res.locals.user = user;

    next();
});

exports.isAuthorized = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) return next(new AppError("You do not have premission to perform this action", 403));

        next();
    };
};

// Only for rendered pages, when the user needs access to the page, but should only see certain content when logged in or not
exports.isLoggedIn = async (req, res, next) => {
    if (!req.cookies.jwt) return next();

    try {
        const decodedToken = await checkToken(req.cookies.jwt);

        const user = await User.findById(decodedToken.id).select("+role");
        if (!user) return next();

        // 4. Check if user changed pass after the JWT was issued
        if (user.passwordChangedAfterJWT(decodedToken.iat)) return next();

        req.user = user;
        res.locals.user = user; //sets user object to be used inside render template
    } catch (error) {
        return next();
    }

    next();
};
