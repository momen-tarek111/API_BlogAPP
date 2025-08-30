const router=require("express").Router()
const { createPostCtrl, getAllPostsCtrl, getSinglePostCtrl, getPostsCountCtrl, deletePostCtrl, updatePostCtrl, updatePostImageCtrl, toggleLikeCtrl } = require("../controllers/postsControllers");
const photoUpload = require("../middlewares/photoUpload");
const validateObjectId = require("../middlewares/validateObjectId");
const { verifyToken } = require("../middlewares/verifyToken");

router.route("/")
      .post(verifyToken,photoUpload.single("image"),createPostCtrl)
      .get(getAllPostsCtrl)

router.get("/count",getPostsCountCtrl)
router.route("/:id")
      .get(validateObjectId,getSinglePostCtrl)
      .delete(validateObjectId,verifyToken,deletePostCtrl)
      .put(validateObjectId,verifyToken,updatePostCtrl)
router.put("/upload-image/:id",validateObjectId,verifyToken,photoUpload.single("image"),updatePostImageCtrl)
router.put("/like/:id",validateObjectId,verifyToken,toggleLikeCtrl)
module.exports=router