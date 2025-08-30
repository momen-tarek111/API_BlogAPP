const asyncHandler=require("express-async-handler")
const {Comment,validateCrateComment,validateUpdateComment} =require("../models/Comment")
const {User} =require("../models/User")

/**--------------------------------
 * @description Create New Comment
 * @route /api/comments
 * @method POST
 * @access private (only logged in user)
-----------------------------------*/
module.exports.createCommentCtrl = asyncHandler(
    async (req, res) => {
        const { error } = validateCrateComment(req.body)
        if (error) {
            return res.status(400).json(error.details[0].message)
        }
        const profile = await User.findById(req.user.id)

        const comment=await Comment.create({
            postId:req.body.postId,
            user:req.user.id,
            text:req.body.text,
            username:profile.username
        })
        res.status(201).json(comment)
    }
)


/**--------------------------------
 * @description Get All Comments
 * @route /api/comments
 * @method GET
 * @access private (only admin)
-----------------------------------*/
module.exports.getAllCommentsCtrl = asyncHandler(
    async (req, res) => {
        const comments=await Comment.find().populate("user")
        res.status(200).json(comments)
    }
)

/**--------------------------------
 * @description Delete Comment
 * @route /api/comments/:id
 * @method DELETE
 * @access private (only admin or owner of this Comment)
-----------------------------------*/
module.exports.deleteCommentCtrl = asyncHandler(
    async (req, res) => {
        const comment=await Comment.findById(req.params.id)
        if(!comment){
            return res.status(404).json({message:"Comment Not Found"})
        }
        if(req.user.isAdmin||req.user.id===comment.user.toString()){
            await Comment.findByIdAndDelete(req.params.id)
            return res.status(200).json({message:"Comment has been deleted"})
        }
        else{
            return res.status(403).json({message:"access denied , not allowed"})
        }
    }
)

/**--------------------------------
 * @description Update Comment
 * @route /api/comments/:id
 * @method PUT
 * @access private (only owner of this Comment)
-----------------------------------*/
module.exports.updateCommentCtrl = asyncHandler(
    async (req, res) => {
        const { error } = validateUpdateComment(req.body)
        if (error) {
            return res.status(400).json(error.details[0].message)
        }

        const comment=await Comment.findById(req.params.id)
        if(!comment){
            return res.status(404).json({message:"Comment Not Found"})
        }
        if(req.user.id!==comment.user.toString()){
            return res.status(403).json({message:"access denied , not allowed"})
        }

        const updatedComment=await Comment.findByIdAndUpdate(req.params.id,{
            $set:{
                text:req.body.text
            }
        },{new:true})


        res.status(201).json(updatedComment)
    }
)