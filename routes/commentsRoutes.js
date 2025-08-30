const { createCommentCtrl, getAllCommentsCtrl, deleteCommentCtrl, updateCommentCtrl } = require("../controllers/commentsControllers")
const validateObjectId = require("../middlewares/validateObjectId")
const { verifyToken, verifyTokenAndAdmin } = require("../middlewares/verifyToken")

const router=require("express").Router()


router.route("/")
      .post(verifyToken,createCommentCtrl)
      .get(verifyTokenAndAdmin,getAllCommentsCtrl)

router.route("/:id")
      .delete(validateObjectId,verifyToken,deleteCommentCtrl)
      .put(validateObjectId,verifyToken,updateCommentCtrl)
module.exports=router