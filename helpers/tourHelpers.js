const multer = require("multer");
const sharp = require("sharp");
const catchAsync = require("../utils/catchAsync");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, callback) => {
    //check if the uploaded file is an image
    if (!file.mimetype.startsWith("image")) {
        return callback(new AppError("Only image files allowed", 404), false);
    }

    callback(null, true);
};

const multerConfig = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

// ===================== EXPORTS =====================
// multerUpload.single("images"); single
// multerUpload.array("images", 3); multiple
// mixed
exports.multerUpload = multerConfig.fields([
    {
        name: "imageCover",
        maxCount: 1,
    },
    {
        name: "images",
        maxCount: 3,
    },
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
    if (!req.files.imageCover || !req.files.images) return next();

    // process cover image
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer).resize(2000, 1333).toFormat("jpeg").jpeg({ quality: 90 }).toFile(`public/img/tours/${req.body.imageCover}`);

    // process images
    req.body.images = [];
    const imagesPromise = req.files.images.map(async (img, i) => {
        const fileName = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
        await sharp(img.buffer).resize(2000, 1333).toFormat("jpeg").jpeg({ quality: 90 }).toFile(`public/img/tours/${fileName}`);

        req.body.images.push(fileName);
    });

    await Promise.all(imagesPromise);

    next();
});
