const express = require("express");
const { getAllTours, getTour, createTour, deleteTour, updateTour, aliasTopTours, getTourStats, getMonthlyPlan, getNearbyTours, getDistances } = require("../controllers/TourController");
const { isAuthenticated, isAuthorized } = require("../controllers/AuthController");
const { multerUpload, resizeTourImages } = require("../helpers/tourHelpers");
const reviewRouter = require("../routes/reviews");
const router = express.Router();

router.use("/:tourID/reviews", reviewRouter);

//middleware that runs only if certain param is present.
// router.param("id", checkID);

router.route("/top-5-cheap").get(aliasTopTours, getAllTours);
router.route("/tour-stats").get(getTourStats);
router.route("/monthly-plan/:year").get(isAuthenticated, isAuthorized("admin", "lead-guide", "guide"), getMonthlyPlan);
router.route("/tours-nearby/:distance/center/:latlng/unit/:unit").get(getNearbyTours);
router.route("/distances/:latlng/unit/:unit").get(getDistances);

router.route("/").get(getAllTours).post(isAuthenticated, isAuthorized("admin", "lead-guide"), createTour);
router.route("/:id").get(getTour).patch(isAuthenticated, isAuthorized("admin", "lead-guide"), multerUpload, resizeTourImages, updateTour).delete(isAuthenticated, isAuthorized("admin", "lead-guide"), deleteTour);

module.exports = router;
