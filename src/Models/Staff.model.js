const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const StaffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Enter staff name"],
  },
  email: {
    type: String,
    required: [true, "Enter staff email"],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Email address wrong",
    ],
  },
  role: {
    type: String,
    required: [true, "Enter staff role"],
    enum: ["administrator", "general"],
    default: "general",
  },
  affiliation: {
    type: String,
    required: [true, "Enter staff affiliation"],
  },
  prevPasswords: {
    type: [String],
    default: [],
    select: false,
  },
  password: {
    type: String,
    minlength: 4,
    required: [true, "Enter staff password"],
    select: false,
  },
  passwordExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

StaffSchema.pre("save", async function (next) {
  if (!this.isModified("password")) next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.passwordExpire = Date.now() + 6 * 30 * 24 * 60 * 60 * 1000;
  next();
});

StaffSchema.methods.getJsonWebToken = function () {
  const token = jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_SECRET_EXPIRESIN,
    }
  );
  return token;
};

StaffSchema.methods.checkPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

StaffSchema.methods.isChangePassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  encryptedPassword = await bcrypt.hash(password, salt);
  let isExist = false;

  this.prevPasswords.map(async (element) => {
    if (!isExist) {
      isExist = bcrypt.compareSync(password, element);
    }
  });

  if (isExist) {
    return false;
  }

  if (this.prevPasswords.length < 4) {
    this.prevPasswords.push(encryptedPassword);
    return true;
  } else {
    this.prevPasswords.shift();
    this.prevPasswords.push(encryptedPassword);
    return true;
  }
};

StaffSchema.methods.generatePasswordChangeToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model("Staff", StaffSchema);
