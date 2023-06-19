const express = require("express");
const {
  register,
  login,
  getStaffs,
  getStaff,
  changePassword,
  updateUser,
  deleteUser,
  forgotPassword,
  resetPassword,
  setPassword,
} = require("../Controllers/Staff.controller");
const { checkAuth, checkRole } = require("../Middlewares/checkRoleAndAuth");

const router = express.Router();

//api/users
router.route("/login").post(login);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);
router.route("/set-password").post(setPassword);
router.route("/register").post(register);
router.use(checkAuth);

// router.route(checkRole("administrator", "general"), "/register").post(register);

//api/users
router
  .route("/change-password")
  .post(checkRole("administrator", "general"), changePassword);
router.route("/").get(checkRole("administrator"), getStaffs);
router
  .route("/:id")
  .get(checkRole("administrator", "general"), getStaff)
  .put(checkRole("administrator"), updateUser)
  .delete(checkRole("administrator"), deleteUser);

module.exports = router;
