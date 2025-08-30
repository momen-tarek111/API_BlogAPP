const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const { User, validateEmail, validateNewPassword } = require("../models/User");
const VerificationToken = require("../models/VerificationToken");
const sendEmail = require("../utils/sendEmail");
/**--------------------------------
 * @description Send Reset Password Link
 * @route /api/password/reset-password-link
 * @method POST
 * @access public
-----------------------------------*/

module.exports.sendResetPasswordLinkCtrl = asyncHandler(async (req, res) => {
  const { error } = validateEmail(req.body);
  if (error) {
    return res.status(400).json(error.details[0].message);
  }
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res
      .status(400)
      .json({ message: "User with given email dose not exist!" });
  }
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
  const link = `${process.env.CLIENT_DOMAIN}/reset-password/${user._id}/${verificationToken.token}`;
  const htmlTemplate = `
        <div>
            <p>Click on the link below to reset your password</p>
            <a href="${link}">reset password</a>
        </div>
    `;
  await sendEmail(user.email, "Reset Password", htmlTemplate);
  res.status(200).json({
    message:
      "Password reset link was sent to your email ,please check your email",
  });
});
/**--------------------------------
 * @description Get Reset Password Link
 * @route /api/password/reset-password/:userId/:token
 * @method GET
 * @access public
-----------------------------------*/

module.exports.getResetPasswordLinkCtrl = asyncHandler(async (req, res) => {
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
  res.status(200).json({ message: "valid link" });
});

/**--------------------------------
 * @description Reset Password
 * @route /api/password/reset-password/:userId/:token
 * @method POST
 * @access public
-----------------------------------*/
module.exports.resetPasswordCtrl = asyncHandler(async (req, res) => {
  const { error } = validateNewPassword(req.body);
  if (error) {
    return res.status(400).json(error.details[0].message);
  }
  const user = await User.findById(req.params.userId);
  if (!user) {
    return res
      .status(400)
      .json({ message: "invalid link" });
  }
  const verificationToken = await VerificationToken.findOne({
    userId: user._id,
    token: req.params.token,
  });
  if (!verificationToken) {
    return res.status(400).json({ message: "invalid link" });
  }
  const slat = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, slat);

  user.password=hashedPassword;
  await user.save();
  await VerificationToken.findByIdAndDelete(verificationToken._id);

  res.status(200).json({message:"Password reset successfully , please login "})
});
