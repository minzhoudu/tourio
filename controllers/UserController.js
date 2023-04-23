const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const { deleteOne, updateOne, getAll, getOne } = require("./factories/handlerFactory");
const { filterUserObj } = require("../helpers/userHelpers");

// Endpoints

exports.getAllUsers = getAll(User);

exports.getSelf = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

exports.getUser = getOne(User);

exports.updateSelf = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) return next(new AppError("This route is not for password updates. Please use /updatePassword"), 400);

    const allowedFields = ["name", "email"];
    const updatedUserObj = filterUserObj(req.body, allowedFields);
    if (req.file) updatedUserObj.photo = req.file.filename;

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updatedUserObj, {
        new: true,
        runValidators: true,
    });

    if (!updatedUser) return next(new AppError("Something went wrong, please login again.", 400));

    res.status(200).json({
        status: "success",
        user: {
            updatedUser,
        },
    });
});

exports.deleteSelf = catchAsync(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user.id,
        { active: false },
        {
            new: true,
        }
    );

    res.status(204).json({
        status: "success",
        data: null,
    });
});

exports.createUser = (req, res) => {
    res.status(404).json({
        status: "error",
        message: "Please use /signup instead...",
    });
};

exports.updateUser = updateOne(User);
exports.deleteUser = deleteOne(User);
