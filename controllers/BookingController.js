const stripe = require("stripe")(process.env.STRIPE_SECRET);
const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");
const { createBookingCheckout } = require("../helpers/bookingHelpers");

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.tourID);

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        success_url: `${req.protocol}://${req.get("host")}/my-tours`,
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

exports.webhookCheckout = (req, res, next) => {
    const signature = req.headers["stripe-signature"];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (error) {
        console.log(`Webhook Error: ${error.message}`);
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    if (event.type === "checkout.session.complete") {
        createBookingCheckout(event.data.object);
        res.status(200).json({
            recieved: true,
        });
    }
};
