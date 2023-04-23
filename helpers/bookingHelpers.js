const Booking = require("../models/bookingModel");
const User = require("../models/userModel");

exports.createBookingCheckout = async (session) => {
    const tour = session.data.object.client_reference_id;
    const user = (await User.findOne({ email: session.data.object.customer_email })).id;
    const price = session.data.object.amount_total / 100;

    await Booking.create({ tour, user, price });
};
