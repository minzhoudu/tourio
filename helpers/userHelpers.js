const multer = require("multer");
const sharp = require("sharp");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// const multerStorage = multer.diskStorage({
//     destination: (req, file, callback) => {
//         callback(null, "public/img/users");
//     },
//     filename: (req, file, callback) => {
//         //user-id-timestamp.extension (file name pattern)
//         const extension = file.mimetype.split("/")[1];
//         callback(null, `user-${req.user.id}-${Date.now()}.${extension}`);
//     },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, callback) => {
    //check if the uploaded file is an image
    if (!file.mimetype.startsWith("image")) {
        return callback(new AppError("Only image files allowed", 404), false);
    }

    callback(null, true);
};

// ===================== EXPORTS =====================

exports.multerUpload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer).resize(500, 500).toFormat("jpeg").jpeg({ quality: 90 }).toFile(`public/img/users/${req.file.filename}`);

    next();
});

exports.filterUserObj = (body, allowedFields) => {
    const newObj = {};

    for (const [key, value] of Object.entries(body)) {
        if (allowedFields.includes(key)) {
            newObj[key] = value;
        }
    }

    return newObj;
};
