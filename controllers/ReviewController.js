const Reviews = require("../models/reviewModel");
const Bookings = require("../models/bookingModel");
const Tours = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { deleteOne, updateOne, getOne, getAll } = require("./factories/handlerFactory");

exports.getAllReviews = getAll(Reviews);
exports.getSingleReview = getOne(Reviews);
exports.updateReview = updateOne(Reviews);
exports.deleteReview = deleteOne(Reviews);

exports.createReview = catchAsync(async (req, res, next) => {
    const tour = await Tours.findById(req.params.tourID);
    if (!tour) return next(new AppError("The review for this tour couldn't be created, because this tour does not exist", 404));

    //get tours that current user booked
    const userBookings = await Bookings.find({ user: req.user.id, tour: req.params.tourID });
    if (!userBookings.length) return next(new AppError("You can only review the tours you have previously booked", 403));

    //check if the current tour is in the userBookings
    // const tourIncluded = userBookings.some((booking) => {
    //     return booking.tour._id == req.params.tourID;
    // });

    // if (!tourIncluded) return next(new AppError("You can only review the tours you have previously booked", 403));

    const newReview = await Reviews.create({
        review: req.body.review,
        rating: req.body.rating,
        tour: req.params.tourID,
        user: req.user.id,
    });

    res.status(201).json({
        status: "success",
        data: {
            review: newReview,
        },
    });
});
