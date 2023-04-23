const { sendErrorDev, sendErrorProd, handleCastErrorDB, handleDuplicateFieldsDB, handleJWTError, handleJWTExpiredError, handleValidationErrorDB } = require("../helpers/errorHelpers");

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if (process.env.NODE_ENV === "development") {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === "production") {
        let error = {};

        if (err.name === "CastError") error = handleCastErrorDB(err);
        if (err.code === 11000) error = handleDuplicateFieldsDB(err);
        if (err.name === "ValidationError") error = handleValidationErrorDB(err);
        if (err.name === "JsonWebTokenError") error = handleJWTError();
        if (err.name === "TokenExpiredError") error = handleJWTExpiredError();
        if (err.isOperational) error = err
        sendErrorProd(error, req, res);
    }
};
