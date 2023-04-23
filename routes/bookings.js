const express = require("express");
const { isAuthenticated, isAuthorized } = require("../controllers/AuthController");
const { getCheckoutSession } = require("../controllers/BookingController");

const router = express.Router();

router.get("/checkout-session/:tourID", isAuthenticated, getCheckoutSession);

module.exports = router;
