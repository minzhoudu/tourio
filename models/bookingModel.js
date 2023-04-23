const { Schema, model } = require("mongoose");

const bookingModel = new Schema({
    tour: {
        type: Schema.ObjectId,
        ref: "Tours",
        required: [true, "Every booking must belong to a tour"],
    },
    user: {
        type: Schema.ObjectId,
        ref: "Users",
        required: [true, "Every booking must belong to a user"],
    },
    price: {
        type: Number,
        required: [true, "Booking must have a price"],
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    paid: {
        type: Boolean,
        default: true,
    },
});

bookingModel.pre(/^find/, function (next) {
    this.populate("user").populate("tour");

    next();
});

module.exports = model("Bookings", bookingModel);
