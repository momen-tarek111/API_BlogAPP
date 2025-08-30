const { createCategoryCtrl, getAllCategoriesCtrl, deleteCategoryCtrl } = require("../controllers/categoriesControllers")
const validateObjectId = require("../middlewares/validateObjectId")
const { verifyTokenAndAdmin } = require("../middlewares/verifyToken")

const router=require("express").Router()


router.route("/")
      .post(verifyTokenAndAdmin,createCategoryCtrl)
      .get(getAllCategoriesCtrl)

router.delete("/:id",validateObjectId,verifyTokenAndAdmin,deleteCategoryCtrl)

module.exports=router