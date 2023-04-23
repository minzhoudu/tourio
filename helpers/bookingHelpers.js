const Booking = require("../models/bookingModel");
const User = require("../models/userModel");

exports.createBookingCheckout = async (session) => {
    const tour = session.client_reference_id;
    const user = (await User.findOne({ email: session.customer_email })).id;
    const price = session.line_items[0].price_data.unit_amount / 100;

    await Booking.create({ tour, user, price });
};
