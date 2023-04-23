const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");

const { filter, sort, limitData, pagination } = require("../../helpers/apiHelpers");

exports.getAll = (Model) => {
    return catchAsync(async (req, res, next) => {
        //*to allow nested GET reviews on tour
        const query = !req.params.tourID ? {} : { tour: req.params.tourID };

        // 1: BUILD QUERY
        const Query = Model.find(query);
        filter(Query, req.query);
        sort(Query, req.query);
        limitData(Query, req.query);
        pagination(Query, req.query);

        // 2: EXECUTE QUERY
        // const document = await Query.explain(); explain method gives us the explanatin of what happend during querries.
        const document = await Query;

        // 3: SEND RESPONSE
        res.status(200).json({
            status: "success",
            results: document.length,
            data: {
                document,
            },
        });
    });
};

exports.getOne = (Model, populateOptions) => {
    return catchAsync(async (req, res, next) => {
        //* populate() is used to get referenced values and query for them by the ObjectId-s, and return the populated versions of the field
        // const Query = Tour.findById(req.params.id).populate("guides");

        let query = Model.findById(req.params.id);
        if (populateOptions) query = query.populate(populateOptions);

        const document = await query;
        if (!document) {
            return next(new AppError("No document found with that ID", 404));
        }

        res.status(200).json({
            status: "success",
            data: {
                document,
            },
        });
    });
};

exports.createOne = (Model) => {
    return catchAsync(async (req, res, next) => {
        // const document = new Model({}) instead of this we use document.create({})
        // document.save() -\\-
        const document = await Model.create(req.body);

        res.status(201).json({
            status: "success",
            data: {
                document,
            },
        });
    });
};

exports.updateOne = (Model) => {
    return catchAsync(async (req, res, next) => {
        const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true, //returns the updated document to the tour variable, and not the old one
            runValidators: true, //runs the validations defined in tour model for each field we try to update
        });

        if (!document) {
            return next(new AppError("No document found with that ID", 404));
        }

        res.status(200).json({
            status: "success",
            data: {
                document,
            },
        });
    });
};

exports.deleteOne = (Model) => {
    return catchAsync(async (req, res, next) => {
        const document = await Model.findByIdAndDelete(req.params.id);

        if (!document) return next(new AppError("No document found with that ID", 404));

        res.status(204).json({
            status: "success",
            data: null,
        });

        next();
    });
};
