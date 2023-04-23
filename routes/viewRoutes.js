const express = require("express");
router = express.Router();

const { getOverview, getTour, getLoginForm, getUserAccount, getMyTours } = require("../controllers/viewController");
const { isLoggedIn, isAuthenticated } = require("../controllers/AuthController");

// Rendering routes
router.get("/account", isAuthenticated, getUserAccount);
router.get("/my-tours", isAuthenticated, getMyTours);

router.use(isLoggedIn);
router.get("/", getOverview);
router.get("/login", getLoginForm);
router.get("/tour/:tourSlug", getTour);

module.exports = router;
