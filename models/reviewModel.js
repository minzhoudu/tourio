const { Schema, model } = require("mongoose");
const Tour = require("./tourModel");

const reviewSchema = new Schema(
    {
        review: {
            type: String,
            default: "empty",
            trim: true,
            required: [true, "Review cannot be empty! Please write the review"],
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: [true, "Please add the rating for this review"],
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        tour: {
            type: Schema.ObjectId,
            ref: "Tours",
            required: [true, "Review must belong to a tour"],
        },
        user: {
            type: Schema.ObjectId,
            ref: "Users",
            reqired: [true, "Review must belong to a user"],
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        id: false,
    }
);

reviewSchema.index(
    //* We can use indexes to create compound(bundled) index and add the unique value for all of them
    { tour: 1, user: 1 },
    {
        unique: true,
    }
);

//! query middlewares "find, findOne..."
reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: "user",
        select: "name photo",
    });

    // this.populate({
    //     path: "tour",
    //     select: "name",
    // });

    next();
});

reviewSchema.statics.calcAvgRatings = async function (tourID) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourID },
        },
        {
            $group: {
                _id: "$tour",
                ratingsCount: { $sum: 1 },
                avgRating: { $avg: "$rating" },
            },
        },
    ]);

    if (stats.length) {
        await Tour.findByIdAndUpdate(tourID, {
            ratingsQuantity: stats[0].ratingsCount,
            ratingsAverage: stats[0].avgRating,
        });
    } else {
        await Tour.findByIdAndUpdate(tourID, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5,
        });
    }
};

//! Document middleware "save"
reviewSchema.post("save", function (doc) {
    //doc.constructor stands for Review model
    doc.constructor.calcAvgRatings(doc.tour);
});

//findOneAndUpdate, findOneAndDelete
//in .pre() we only have access to the query(current DB), and in the post() we have access only to the finished(saved) document
reviewSchema.post(/^findOneAnd/, async function (doc) {
    if (doc) await doc.constructor.calcAvgRatings(doc.tour);
});

module.exports = model("Reviews", reviewSchema);
