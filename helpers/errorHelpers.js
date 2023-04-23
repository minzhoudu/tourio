const AppError = require("../utils/appError");

exports.sendErrorDev = (err, req, res) => {
    //FOR API
    if (req.originalUrl.startsWith("/api")) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
        });
    }

    //FOR RENDER
    res.status(err.statusCode).render("error", {
        title: "Something went wrong",
        msg: err.message,
    });
};

exports.sendErrorProd = (err, req, res) => {
    // API
    if (req.originalUrl.startsWith("/api")) {
        if (!err.isOperational) {
            //if the programming or other unknown error happens, it would not get isOperatinal true
            return res.status(500).json({
                status: "error",
                message: "Something went wrong",
            });
        }

        //operational (our custom error)
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }

    // RENDER
    if (!err.isOperational) {
        //if the programming or other unknown error happens, it would not get isOperatinal true
        return res.status(500).render("error", {
            title: "Something went wrong",
            msg: "Please try again later",
        });
    }

    //operational (our custom error)
    res.status(err.statusCode).render("error", {
        title: "Something went wrong",
        msg: err.message,
    });
};

exports.handleCastErrorDB = (err) => {
    return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
};

exports.handleDuplicateFieldsDB = (err) => {
    return new AppError(`Duplicate field value: ${Object.keys(err.keyValue)}, please use another value!`, 400);
};

exports.handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((e) => e.message);

    return new AppError(`Invalid input data: ${errors.join(". ")}`, 400);
};

exports.handleJWTError = () => {
    return new AppError("Invalid Token. Please login again", 401);
};

exports.handleJWTExpiredError = () => {
    return new AppError("Your token has expired. Please login again.", 401);
};
