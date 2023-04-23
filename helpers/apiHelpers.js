exports.filter = (Query, queryString) => {
    const queryObj = { ...queryString };

    const excludedQueryString = ["page", "sort", "limit", "fields"];
    excludedQueryString.forEach((el) => delete queryObj[el]);

    const queryStr = JSON.stringify(queryObj).replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    Query.find(JSON.parse(queryStr));
};

exports.sort = (Query, queryString) => {
    if (queryString.sort) {
        const sortBy = queryString.sort.split(",").join(" ");
        Query.sort(sortBy);
    } else {
        Query.sort("-createdAt _id");
    }
};

exports.limitData = (Query, queryString) => {
    if (queryString.fields) {
        const fields = queryString.fields.split(",").join(" ");
        Query.select(fields);
    } else {
        Query.select("-__v");
    }
};

exports.pagination = async (Query, queryString) => {
    const page = queryString.page * 1 || 1;
    const limit = queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    Query.skip(skip).limit(limit);
};
