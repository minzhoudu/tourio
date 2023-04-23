// const fs = require("fs");
const Tour = require("../models/tourModel");

const { deleteOne, updateOne, createOne, getOne, getAll } = require("./factories/handlerFactory");
const catchAsync = require("../utils/catchAsync");

const AppError = require("../utils/appError");

// let tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

exports.getAllTours = getAll(Tour);
exports.getTour = getOne(Tour, { path: "reviews" });
exports.createTour = createOne(Tour);
exports.updateTour = updateOne(Tour);
exports.deleteTour = deleteOne(Tour);

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = "5";
    req.query.sort = "-ratingsAverage, price";
    req.query.fields = "name,price,ratingsAverage,summary,difficulty";

    next();
};

exports.getTourStats = catchAsync(async (req, res, next) => {
    //! aggregate je funkcija nad mongoose modelom koja sluzi za grupisanje podataka i izvrsavanje odredjenih funkcija nad njima.
    //! $group grupise podatke po odredjenom _id parametru, taj parametar moze biti bilo koji podatak u bazi, tipa ime, cena, tezina, ocena...
    //? Prvo radimo $match (filterujemo podatke koji ispunjavaju query $gte: 4.5)
    //? Zatim ih grupisemo po ID-ju
    //? Nakon toga za sve isfiltrirane podatke racunamo avg, min, max...
    const stats = await Tour.aggregate([
        {
            $match: {
                ratingsAverage: { $gte: 4.5 },
                secretTour: { $ne: true },
            },
        },
        {
            $group: {
                _id: { $toUpper: "$difficulty" }, //null se stavlja kad hocemo da stavimo sve u jednu veliku grupu
                numOfTours: { $sum: 1 },
                numOfRatings: { $sum: "$ratingsQuantity" },
                avgRating: { $avg: "$ratingsAverage" },
                avgPrice: { $avg: "$price" },
                minPrice: { $min: "$price" },
                maxPrice: { $max: "$price" },
            },
        },
        {
            $sort: { avgPrice: 1 },
        },
        // {
        //     $match: {
        //         _id: { $ne: "EASY" },
        //     },
        // },
    ]);

    res.status(200).json({
        status: "success",
        data: {
            stats,
        },
    });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
        {
            $unwind: "$startDates",
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-1-1`),
                    $lte: new Date(`${year}-12-31`),
                },
            },
        },
        {
            $group: {
                _id: { $month: "$startDates" },
                count: { $sum: 1 },
                tours: { $push: "$name" },
            },
        },
        {
            $addFields: {
                month: "$_id",
            },
        },
        {
            $project: {
                _id: 0,
            },
        },
        {
            $sort: { month: 1 },
        },
        {
            $limit: 15,
        },
    ]);

    res.status(200).json({
        status: "success",
        data: {
            plan,
        },
    });
});

exports.getNearbyTours = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(",");
    const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng) return next(new AppError("Please provide latitude and longitude in the format: lat,lng.", 400));

    const tours = await Tour.find({
        startLocation: {
            $geoWithin: { $centerSphere: [[lng, lat], radius] },
        },
    });

    res.status(200).json({
        status: "success",
        results: tours.length,
        data: {
            tours,
        },
    });
});

exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(",");

    if (!lat || !lng) return next(new AppError("Please provide latitude and longitude in the format: lat,lng", 400));
    if (unit !== "km" && unit !== "mi") return next(new AppError("Please provide the correct unit value: km/mi"));

    const unitMultiplier = unit === "mi" ? 0.000621371 : 0.001;

    //geoNear must always be the first in the aggregator when working with geodata
    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: [parseInt(lng), parseInt(lat)],
                },
                distanceField: "distance",
                distanceMultiplier: unitMultiplier,
            },
        },
        {
            $project: {
                distance: 1,
                name: 1,
            },
        },
    ]);

    res.status(200).json({
        status: "success",
        results: distances.length,
        data: {
            distances,
        },
    });
});
