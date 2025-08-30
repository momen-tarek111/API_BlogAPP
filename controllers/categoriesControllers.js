const asyncHandler=require("express-async-handler")
const {Category,validateCrateCategory} =require("../models/Category")

/**--------------------------------
 * @description Create New Category
 * @route /api/categories
 * @method POST
 * @access private (only Admin)
-----------------------------------*/

module.exports.createCategoryCtrl = asyncHandler(
    async (req, res) => {
        const { error } = validateCrateCategory(req.body)
        if (error) {
            return res.status(400).json(error.details[0].message)
        }
        const category=await Category.create({
            user:req.user.id,
            title:req.body.title,
        })
        res.status(201).json(category)
    }
)
/**--------------------------------
 * @description Get All Categories
 * @route /api/categories
 * @method GET
 * @access public
-----------------------------------*/
module.exports.getAllCategoriesCtrl = asyncHandler(
    async (req, res) => {
        const categories=await Category.find();
        res.status(200).json(categories)
    }
)

/**--------------------------------
 * @description Delete Category
 * @route /api/categories/:id
 * @method DELETE
 * @access private (only admin)
-----------------------------------*/
module.exports.deleteCategoryCtrl = asyncHandler(
    async (req, res) => {
        const category=await Category.findById(req.params.id)
        if(!category){
            return res.status(404).json({message:"Category Not Found"})
        }
        await Category.findByIdAndDelete(req.params.id)
        return res.status(200).json({message:"Category has been deleted",categoryId:category._id})

    }
)