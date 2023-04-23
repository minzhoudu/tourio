const express = require("express");
const { getAllUsers, getUser, createUser, updateUser, deleteUser, updateSelf, deleteSelf, getSelf } = require("../controllers/UserController");
const { multerUpload, resizeUserPhoto } = require("../helpers/userHelpers");
const { signup, login, logout, forgotPassword, resetPassword, updatePassword, isAuthenticated, isAuthorized } = require("../controllers/AuthController");
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);

router.use(isAuthenticated); //*all the endpoints that come after this line will need to be authenticated
router.get("/me", getSelf, getUser);
router.patch("/updateInfo", multerUpload.single("photo"), resizeUserPhoto, updateSelf); //upload.single('photo') single means uploading one single file, 'photo' is the field in the form that is going to include the file to upload
router.patch("/updatePassword", updatePassword);
router.delete("/deleteInfo", deleteSelf);

router.use(isAuthorized("admin"));
router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
