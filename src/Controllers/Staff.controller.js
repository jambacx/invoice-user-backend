const ssh = require("../lib/ssh");
const Log = require("../Models/AccessLog.model");
const Staff = require("../Models/Staff.model");
const CustomError = require("../lib/customError");
const crypto = require("crypto");

exports.register = async (req, res, next) => {
  try {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@#?]).{8,}$/;

    if (!passwordRegex.test(req.body.password)) {
      throw new CustomError("password is not valid", 400);
    }

    const staff = await Staff.create(req.body);
    const token = staff.getJsonWebToken();
    await staff.isChangePassword(req.body.password);
    await staff.save();
    res.status(200).json({ success: true, staff: staff, token: token });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    //check input
    if (!email || !password) {
      throw new CustomError("please enter email and password", 400);
    }
    // search staff
    const staff = await Staff.findOne({ email: email }).select("+password");
    if (!staff) {
      throw new CustomError("your email or password is wrong", 401);
    }
    if (staff.passwordExpire < Date.now()) {
      throw new CustomError("your password is expired", 401);
    }
    const checkPassword = await staff.checkPassword(password);
    if (!checkPassword) {
      throw new CustomError("your email or password is wrong", 401);
    }
    const token = staff.getJsonWebToken();

    res.status(200).json({ success: true, staff: staff, token: token });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const updateFields = {
      name: req.body.name,
      affiliation: req.body.affiliation,
    };
    const staff = await Staff.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    });
    if (!staff) {
      throw new CustomError("No staff found", 400);
    }
    res.status(200).json({
      success: true,
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      throw new CustomError("No staff found", 400);
    }

    staff.remove();

    res.status(200).json({
      success: true,
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    if (!req.body.email) {
      throw new CustomError("Please insert a email address", 400);
    }
    const staff = await Staff.findOne({ email: req.body.email });
    if (!staff) {
      throw new CustomError("Email not found", 400);
    }
    const resetToken = staff.generatePasswordChangeToken();
    await staff.save();

    //connect ssh server and send email
    await ssh.connect();
    const email = req.body.email;
    const address = req.protocol + "://" + req.get("host");
    const link = `${address}/api/staffs/changepassword/${resetToken}`;
    const response = await ssh.sendEmail({
      link,
      email,
    });
    if (response === 0) {
      throw new CustomError("External email server error", 400);
    }
    res.status(200).json({
      success: true,
      resetToken: resetToken,
    });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    if (!req.body.resetToken || !req.body.password) {
      throw new CustomError("Please insert a token and password", 400);
    }
    const encrypted = crypto
      .createHash("sha256")
      .update(req.body.resetToken)
      .digest("hex");

    const staff = await Staff.findOne({
      resetPasswordToken: encrypted,
      resetPasswordExpire: { $gt: Date.now() },
    }).select("+prevPasswords");

    if (!staff) {
      throw new CustomError("Token expired", 400);
    }

    const isChangePassword = await staff.isChangePassword(req.body.password);

    if (!isChangePassword) {
      throw new CustomError("Previous used password", 400);
    }
    staff.password = req.body.password;
    staff.resetPasswordToken = undefined;
    staff.resetPasswordExpire = undefined;
    await staff.save();

    const token = staff.getJsonWebToken();
    res.status(200).json({ success: true, staff: staff, token: token });
  } catch (error) {
    next(error);
  }
};

exports.getStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      throw new CustomError("staff not found", 400);
    }

    res.status(200).json({
      success: true,
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

exports.getStaffs = async (req, res, next) => {
  try {
    const staffs = await Staff.find({});

    res.status(200).json({
      success: true,
      data: staffs,
    });
  } catch (error) {
    next(error);
  }
};
