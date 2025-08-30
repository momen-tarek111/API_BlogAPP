const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const {
  User,
  validateRegisterUser,
  validateLoginUser,
} = require("../models/User");
const VerificationToken = require("../models/VerificationToken");
const sendEmail = require("../utils/sendEmail");




/**--------------------------------
 * @description Register New User
 * @route /api/auth/register
 * @method Post
 * @access public
-----------------------------------*/

module.exports.registerUserCtrl = asyncHandler(async (req, res) => {
  const { error } = validateRegisterUser(req.body);
  if (error) {
    return res.status(400).json(error.details[0].message);
  }
  let user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(400).json({ message: "user already exist" });
  }
  const slat = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, slat);

  user = new User({
    username: req.body.username,
    email: req.body.email,
    password: hashedPassword,
  });
  await user.save();
  const verificationToken = new VerificationToken({
    userId: user._id,
    token: crypto.randomBytes(32).toString("hex"),
  });
  await verificationToken.save();

  const link = `${process.env.CLIENT_DOMAIN}/users/${user._id}/verify/${verificationToken.token}`;

  const htmlTemplate = `
    <div>
      <p>Click on the link below to verify your email</p>
      <a href="${link}">verify</a>
    </div>
  `;
  await sendEmail(
    user.email,
    "you registered successfully, please log in",
    htmlTemplate
  );
  res.status(201).json({
    message: "We sent to you an email, please verify your email address",
  });
});

/**--------------------------------
 * @description Login User
 * @route /api/auth/login
 * @method Post
 * @access public
-----------------------------------*/

module.exports.loginUserCtrl = asyncHandler(async (req, res) => {
  const { error } = validateLoginUser(req.body);
  if (error) {
    return res.status(400).json(error.details[0].message);
  }
  let user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).json({ message: "invalid Email or Password" });
  }
  const isPasswordMatch = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (!isPasswordMatch) {
    return res.status(400).json({ message: "invalid Email or Password" });
  }

  if (!user.isAccountVerified) {
    let verificationToken = await VerificationToken.findOne({
      userId: user._id,
    });
    if (!verificationToken) {
      verificationToken = new VerificationToken({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      });
      await verificationToken.save();
    }
    const link = `${process.env.CLIENT_DOMAIN}/users/${user._id}/verify/${verificationToken.token}`;

    const htmlTemplate = `
        <div>
          <p>Click on the link below to verify your email</p>
          <a href="${link}">verify</a>
        </div>
      `;
    await sendEmail(
      user.email,
      "you registered successfully, please log in",
      htmlTemplate
    );
    res.status(400).json({
      message: "We sent to you an email, please verify your email address",
    });
  }

  const token = user.generateToken();

  return res.status(200).json({
    _id: user.id,
    isAdmin: user.isAdmin,
    profilePhoto: user.profilePhoto,
    token,
    username: user.username,
  });
});

/**--------------------------------
 * @description Verify User Account
 * @route /api/auth/:userId/verify/:token
 * @method GET
 * @access public
-----------------------------------*/

module.exports.verifyUserAccountCtrl = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(400).json({ message: "invalid link" });
  }
  const verificationToken = await VerificationToken.findOne({
    userId: user._id,
    token: req.params.token,
  });
  if (!verificationToken) {
    return res.status(400).json({ message: "invalid link" });
  }
  user.isAccountVerified = true;
  await user.save();
  await VerificationToken.findByIdAndDelete(verificationToken._id)
  res.status(200).json({ message: "Your account verified" });
});
