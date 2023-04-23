const express = require("express");
const { getAllReviews, getSingleReview, createReview, deleteReview, updateReview } = require("../controllers/ReviewController");
const { isAuthenticated, isAuthorized } = require("../controllers/AuthController");

const router = express.Router({
    //* each route has access to its specific params, so we need mergeParams to access the tourID from the tours router
    mergeParams: true,
});

router.use(isAuthenticated);
router.route("/").get(getAllReviews).post(isAuthorized("user"), createReview);
router.route("/:id").get(getSingleReview).delete(isAuthorized("admin", "user"), deleteReview).patch(isAuthorized("admin", "user"), updateReview);

module.exports = router;
