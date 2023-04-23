const stripe = require("stripe")(process.env.STRIPE_SECRET);
const Tour = require("../models/tourModel");
const Booking = require("../models/bookingModel");
const catchAsync = require("../utils/catchAsync");

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.tourID);

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        success_url: `${req.protocol}://${req.get("host")}/?tour=${req.params.tourID}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourID,
        line_items: [
            {
                price_data: {
                    currency: "eur",
                    unit_amount: tour.price * 100,
                    product_data: {
                        name: tour.name,
                        description: tour.summary,
                    },
                },
                quantity: 1,
            },
        ],
        mode: "payment",
    });

    res.status(200).json({
        status: "success",
        session,
    });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
    const { tour, user, price } = req.query;
    if (!tour || !user || !price) return next();

    await Booking.create({ tour, user, price });

    res.redirect(req.originalUrl.split("?")[0]);
});
