const router=require("express").Router()
const photoUpload = require("../middlewares/photoUpload");
const { getAllUsersCtrl, getUsersProfileCtrl, updateUserProfileCtrl, getUsersCountCtrl, profilePhotoUploadCtrl, deleteUserProfileCtrl } = require("../controllers/usersController");
const validateObjectId = require("../middlewares/validateObjectId");
const { verifyTokenAndAdmin, verifyTokenAndOnlyUser, verifyToken, verifyTokenAndAuthorization } = require("../middlewares/verifyToken");


router.get("/profile",verifyTokenAndAdmin,getAllUsersCtrl)
router.route("/profile/:id")
      .get(validateObjectId,getUsersProfileCtrl)
      .put(validateObjectId,verifyTokenAndOnlyUser,updateUserProfileCtrl)
      .delete(validateObjectId,verifyTokenAndAuthorization,deleteUserProfileCtrl)

router.post("/profile/profile-photo-upload",verifyToken,photoUpload.single("image"),profilePhotoUploadCtrl)


router.get("/count",verifyTokenAndAdmin,getUsersCountCtrl)

module.exports=router;