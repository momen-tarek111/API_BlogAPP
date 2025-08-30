const router=require("express").Router()

const { registerUserCtrl,loginUserCtrl, verifyUserAccountCtrl }=require("../controllers/authControllers")


router.post("/register",registerUserCtrl)
router.post("/login",loginUserCtrl)
router.get("/:userId/verify/:token",verifyUserAccountCtrl)
module.exports=router;