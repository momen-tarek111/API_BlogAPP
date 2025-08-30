const { sendResetPasswordLinkCtrl, getResetPasswordLinkCtrl, resetPasswordCtrl } = require("../controllers/passwordControllers");

const router=require("express").Router()



router.post("/reset-password-link",sendResetPasswordLinkCtrl)
router.route("/reset-password/:userId/:token")
      .get(getResetPasswordLinkCtrl)
      .post(resetPasswordCtrl)

module.exports=router;