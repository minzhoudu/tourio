const Tour = require("../models/tourModel");
const Booking = require("../models/bookingModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getOverview = catchAsync(async (req, res) => {
    const tours = await Tour.find();

    res.status(200).render("overview", {
        tours,
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findOne({ slug: req.params.tourSlug })
        .populate({
            path: "reviews",
            fields: "review rating user",
        })
        .populate({
            path: "guides",
            fields: "role photo name",
        });
    if (!tour) return next(new AppError("That tour does not exist", 404));

    res.status(200).render("tour", {
        title: tour.name,
        tour,
    });
});

exports.getLoginForm = (req, res) => {
    if (req.user) res.redirect("/");
    res.status(200).render("login", {
        title: "Login",
    });
};

exports.getUserAccount = catchAsync(async (req, res, next) => {
    res.status(200).render("account", {
        title: "Your Account",
    });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
    const userBookings = await Booking.find({ user: req.user.id });
    const tours = userBookings.map((booking) => booking.tour);

    res.status(200).render("overview", {
        title: "My Tours",
        tours,
    });
});
