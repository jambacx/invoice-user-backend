const ssh = require("../lib/ssh");
const Log = require("../Models/AccessLog.model");
const Staff = require("../Models/Staff.model");
const CustomError = require("../lib/customError");
const crypto = require("crypto");

exports.register = async (req, res, next) => {
  try {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@#?]).{8,}$/;
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#?";
    req.body.password = "";

    while (!passwordRegex.test(req.body.password)) {
      for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        req.body.password += characters[randomIndex];
      }
    }

    const staff = await Staff.create(req.body);
    await staff.isChangePassword(req.body.password);
    const setPasswordToken = staff.generatePasswordSetToken();
    await staff.save();

    if (staff) {
      //create set password token and send new email to user

      console.log("========================");
      console.log(setPasswordToken);
      console.log("========================");

      // await ssh.connect();
      // const email = req.body.email;
      // const address = req.protocol + "://" + req.get("host");
      // const link = `${address}/007/setpassword/${setPasswordToken}`;
      // const response = await ssh.sendEmail({
      //   link,
      //   email,
      // });

      // if (response === 0) {
      //   throw new CustomError("External email server error", 400);
      // }
    }

    res.status(200).json({ success: true, message: "user successfully added" });
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
      throw new CustomError("Invalid username or password", 401);
    }

    if (staff.isLocked) {
      if (staff.setPasswordTokenExpire < Date.now()) {
        //set password token expired and send new email to user
        await ssh.connect();
        const email = req.body.email;
        const address = req.protocol + "://" + req.get("host");
        const link = `${address}/007/setpassword/${staff.setPasswordTokenExpire}`;
        const response = await ssh.sendEmail({
          link,
          email,
        });
        if (response === 0) {
          throw new CustomError("External email server error", 400);
        }
      }
      throw new CustomError(
        "User account locked. Please check your email and active your account.",
        401
      );
    }

    if (staff.passwordExpire < Date.now()) {
      throw new CustomError("your password is expired", 401);
    }

    const checkPassword = await staff.checkPassword(password);
    if (!checkPassword) {
      // Increment login attempts if login fails
      const loginAttempts = staff.loginAttempts + 1;
      await Staff.findByIdAndUpdate(staff._id, { loginAttempts });

      if (loginAttempts >= 7) {
        // Lock the staff if login attempts exceed the threshold
        await Staff.findByIdAndUpdate(staff._id, { isLocked: true });
        const setPasswordToken = staff.generatePasswordSetToken();
        await ssh.connect();
        const email = req.body.email;
        const address = req.protocol + "://" + req.get("host");
        const link = `${address}/007/setpassword/${setPasswordToken}`;
        const response = await ssh.sendEmail({
          link,
          email,
        });
        if (response === 0) {
          throw new CustomError("External email server error", 400);
        }

        throw new CustomError(
          "Staff account locked. Please check your email and active your account .",
          401
        );
      }
      throw new CustomError("Invalid username or password", 401);
    }

    const token = staff.getJsonWebToken();

    //clear loginAttempts
    if (staff.loginAttempts > 0) {
      const loginAttempts = 0;
      await Staff.findByIdAndUpdate(staff._id, { loginAttempts });
    }

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
    const link = `${address}/007/changepassword/${resetToken}`;
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
    //check password
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@#?]).{8,}$/;

    if (!passwordRegex.test(req.body.password)) {
      throw new CustomError("your password is not valid", 400);
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

exports.setPassword = async (req, res, next) => {
  try {
    if (!req.body.setToken || !req.body.password) {
      throw new CustomError("Please insert a token and password", 400);
    }
    const encrypted = crypto
      .createHash("sha256")
      .update(req.body.setToken)
      .digest("hex");

    const staff = await Staff.findOne({
      setPasswordToken: encrypted,
      setPasswordTokenExpire: { $gt: Date.now() },
    }).select("+prevPasswords");

    if (!staff) {
      throw new CustomError("Token expired", 400);
    }

    const isChangePassword = await staff.isChangePassword(req.body.password);

    if (!isChangePassword) {
      throw new CustomError("Previous used password", 400);
    }
    //check password
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@#?]).{8,}$/;

    if (!passwordRegex.test(req.body.password)) {
      throw new CustomError("your password is not valid", 400);
    }

    staff.password = req.body.password;
    staff.setPasswordToken = undefined;
    staff.setPasswordTokenExpire = undefined;
    await staff.save();

    const token = staff.getJsonWebToken();
    res.status(200).json({ success: true, staff: staff, token: token });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      throw new CustomError("Please insert a old and new password", 400);
    }

    const staff = await Staff.findById(req.userId)
      .select("+prevPasswords")
      .select("+password");

    if (!staff) {
      throw new CustomError("User is not found", 400);
    }

    const checkPassword = await staff.checkPassword(oldPassword);
    if (!checkPassword) {
      throw new CustomError("your old password is wrong", 401);
    }

    const isChangePassword = await staff.isChangePassword(newPassword);

    if (!isChangePassword) {
      throw new CustomError("Previous used password", 400);
    }
    //check password
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@#?]).{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      throw new CustomError("your password is not valid", 400);
    }

    staff.password = newPassword;
    await staff.save();

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

exports.getStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      throw new CustomError("staff is not found", 400);
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
