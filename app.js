// Modules
const express = require("express");
const path = require("path");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const compression = require("compression");
// const cors = require("cors");

// Handlers
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/ErrorController");

// Routers
const tourRouter = require("./routes/tours");
const userRouter = require("./routes/users");
const reviewRouter = require("./routes/reviews");
const viewRouter = require("./routes/viewRoutes");
const bookingRouter = require("./routes/bookings");

const app = express();

//? Setting the templateing engine for server-side rendering
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Serving static files
app.use(express.static(path.join(__dirname, "public")));

//*Middleware that adds data from the body to the req object
//*Middleware runs before each request that is defined belowe that middleware
//! MIDDLEWARES

// Development logging
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

const limiter = rateLimit({
    max: 100,
    windowMs: 30 * 60 * 1000,
    message: "Too many requests from this IP, please try again in 30 minutes",
});
// Limit requests from the same IP
app.use("/api", limiter);

// Security HTTP headers
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// app.use(
//     cors({
//         origin: "*",
//     })
// );

// Body parser, reading data from the body into req.body
app.use(express.json({ limit: "10kb" }));
// Parses form data when FORM action="/someRoute" is used to hit the endpoint
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
// Parses cookies
app.use(cookieParser());

// Data sanitization against NoSQL query injection (i.e: in the body we could set "email": "{ $gt: "" }" which would get all the emails from DB)
app.use(mongoSanitize());

// Data sanitization against XSS (html injection)
app.use(xss());

// Compressing all the text sent to client (HTML, JSON...)
app.use(compression());

// Prevent parameter polution (i.e: we set same queries /tours?sort=duration&sort=price)
app.use(
    hpp({
        whitelist: ["duration", "maxGroupSize", "ratingsAverage", "ratingsQuantity", "price", "difficulty"],
    })
);

//custom test middlewares
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// API routes
app.use("/", viewRouter);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/bookings", bookingRouter);

//No Route Found// Should be added at the very end of all routes, so the request does reach it only if no other route was hit
//To use the route functionality for all requests (get, post, patch, delete...) we can use app.all
app.all("*", (req, res, next) => {
    next(new AppError(`Cannot find ${req.originalUrl} route on the server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
