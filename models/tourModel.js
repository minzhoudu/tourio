const mongoose = require("mongoose");
const slugify = require("slugify");

// const User = require("./userModel");

const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "A tour must have a name"],
            unique: true,
            trim: true,
            maxlength: [40, "A tour name must have less or eaqual than 40 characters"],
            minlength: [10, "A tour name must have more or eaqual than 10 characters"],
            // validate: [validator.isAlpha, "A tour name must only contain letters"],
        },
        slug: String,
        duration: {
            type: Number,
            required: [true, "A tour must have a duration"],
        },
        maxGroupSize: {
            type: Number,
            required: [true, "A tour must have maximum group size"],
        },
        difficulty: {
            type: String,
            required: [true, " A tour must have a difficulty"],
            enum: {
                values: ["easy", "medium", "difficult"],
                message: "Difficulty can eather be: easy, medium, difficuly",
            },
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, "Rating must be above 1.0"],
            max: [5, "Rating must be below 5.0"],
            set: (val) => parseFloat(val.toFixed(1)),
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            required: [true, "A tour must have a price"],
        },
        priceDiscount: {
            type: Number,
            //custom validation: u funkciji imamo access za This keyword koji pokazuje samo na dokument koji kreiramo (.create() .save())
            //to znaci da pri update funkciji, this nece pokazivati na dokument i ova validacija nece raditi
            validate: {
                validator: function (discount) {
                    return discount < this.price;
                },
                message: "Discount price ({VALUE}) must not be greater than the regular price",
            },
        },
        summary: {
            type: String,
            trim: true,
            required: [true, "A tour must have a summary"],
        },
        description: {
            type: String,
            trim: true,
        },
        imageCover: {
            type: String,
            required: [true, " A tour must have a cover image"],
        },
        images: [String], //how to define array of data (String)
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false,
        },
        startDates: [Date],
        secretTour: {
            type: Boolean,
            default: false,
            // select: false,
        },
        startLocation: {
            //GeoJSON
            type: {
                type: String,
                default: "Point",
                enum: ["Point"],
            },
            coordinates: [Number],
            address: String,
            description: String,
        },
        locations: [
            {
                type: {
                    type: String,
                    default: "Point",
                    enum: ["Point"],
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number,
            },
        ],
        guides: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "Users",
            },
        ],
    },
    // this must be specifiied for virtuals to show up in the object
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        id: false,
    }
);

//*indexing
//1 for asc 0 for desc
// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: "2dsphere" });

//*Virtuals(properties that are not saved in the DB, but created when data is queried)
//must NOT be arrow function because of the THIS keyword
tourSchema.virtual("durationInWeeks").get(function () {
    if (this.duration) return this.duration / 7;
});

//* Virtual populate
tourSchema.virtual("reviews", {
    ref: "Reviews",
    localField: "_id",
    foreignField: "tour",
});

//*document middleware
//Runs before .save() and .create() but not before .insertMany() .findOneAndUpdate() etc...
tourSchema.pre("save", function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

// tourSchema.pre("save", async function (next) { //* this was used when we want to directly populate the guides with the user information, and not reference it
//     const guidesPromises = this.guides.map(async (id) => await User.findById(id).select("+role"));
//     this.guides = await Promise.all(guidesPromises);
//     next();
// });

//Runs after all the pre-middleware functions are completed
//There's no THIS keyword but there's finished document parameter.
tourSchema.post("save", function (document, next) {
    // console.log(document);
});

//* query middleware
// tourSchema.pre("", function (next) { OVO RADI SAMO ZA FIND, NE I ZA findOne, findOneAndUpdate...
//ovo je fix, regEx /^find/ matchuje sve sto pocinje sa "find"
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } });
    this.start = Date.now();
    next();
});

// tourSchema.pre(/^find/, function (next) {
//     this.populate({
//         path: "guides",
//         select: "-__v -role",
//     });
//     next();
// });

tourSchema.post(/^find/, function (doc, next) {
    // console.log(`Query took ${Date.now() - this.start} miliseconds`);
    next();
});

// tourSchema.pre("findOne", function (next) {  SPECIFICIRANJE JEDNOG PO JEDNOG NIJE DOBRO, BOLJE JE URADITI REGEX /^find/ za sve sto pocinje sa find
//     this.find({ secretTour: { $ne: true } });
//     next();
// });

//* Aggregation middleware

// tourSchema.pre("aggregate", function (next) {
//     this.pipeline().unshift({
//         $match: { secretTour: { $ne: true } },
//     });
//     next();
// });

module.exports = mongoose.model("Tours", tourSchema);
