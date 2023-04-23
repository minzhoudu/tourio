const express = require("express");
router = express.Router();

const { getOverview, getTour, getLoginForm, getUserAccount, getMyTours } = require("../controllers/viewController");
const { isLoggedIn, isAuthenticated } = require("../controllers/AuthController");
const { createBookingCheckout } = require("../controllers/BookingController");

// Rendering routes
router.get("/account", isAuthenticated, getUserAccount);
router.get("/my-tours", isAuthenticated, getMyTours);

router.use(isLoggedIn);
router.get("/", createBookingCheckout, getOverview);
router.get("/login", getLoginForm);
router.get("/tour/:tourSlug", getTour);

module.exports = router;
