const express = require("express");
const {
  register,
  login,
  getStaffs,
  getStaff,
  createUser,
  updateUser,
  deleteUser,
  forgotPassword,
  resetPassword,
} = require("../Controllers/Staff.controller");
const { checkAuth, checkRole } = require("../Middlewares/checkRoleAndAuth");

const router = express.Router();

//api/users
router.route("/login").post(login);
router.route("/register").post(register);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);

router.use(checkAuth);

//api/users
router.route("/").get(checkRole("administrator"), getStaffs);
router
  .route("/:id")
  .get(checkRole("administrator", "general"), getStaff)
  .put(checkRole("administrator"), updateUser)
  .delete(checkRole("administrator"), deleteUser);

module.exports = router;
