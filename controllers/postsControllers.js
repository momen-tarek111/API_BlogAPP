const asyncHandler = require("express-async-handler")
const fs = require("fs")
const path = require("path")
const { cloudinaryUploadImage, cloudinaryRemoveImage } = require("../utils/cloudinary")
const { Post, validateCratePost, validateUpdatePost } = require("../models/Post")
const { User } = require("../models/User")
const { Comment } = require("../models/Comment")

/**--------------------------------
 * @description Create New Post
 * @route /api/posts
 * @method POST
 * @access private (only logged in user)
-----------------------------------*/
module.exports.createPostCtrl = asyncHandler(
    async (req, res) => {
        if (!req.file) {
            return res.status(400).json({ message: "no image provided" })
        }
        const user = await User.findById(req.user.id)
        if (!user) {
            res.status(404).json({ message: "User not found" })
        }
        const { error } = validateCratePost(req.body)
        if (error) {
            return res.status(400).json(error.details[0].message)
        }
        const imagePath = path.join(__dirname, `../images/${req.file.filename}`)
        const result = await cloudinaryUploadImage(imagePath);
        const post = await Post.create({
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            user: req.user.id,
            image: {
                url: result.secure_url,
                publicId: result.public_id
            }
        })
        res.status(201).json(post)
        fs.unlinkSync(imagePath)
    }
)

/**--------------------------------
 * @description Get All Posts
 * @route /api/posts
 * @method GET
 * @access public
-----------------------------------*/
module.exports.getAllPostsCtrl = asyncHandler(
    async (req, res) => {
        const POST_PER_PAGE = 3;
        const { pageNumber, category } = req.query;
        let posts
        if (pageNumber) {
            posts = await Post.find()
                .skip((pageNumber - 1) * POST_PER_PAGE)
                .limit(POST_PER_PAGE)
                .sort({ createdAt: -1 })
                .populate("user", ["-password"])
        }
        else if (category) {
            posts = await Post.find({ category })
                .sort({ createdAt: -1 })
                .populate("user", ["-password"])
        }
        else {
            posts = await Post.find()
                .sort({ createdAt: -1 })
                .populate("user", ["-password"])
        }
        res.status(200).json(posts)
    }
)


/**--------------------------------
 * @description Get Single Post
 * @route /api/posts/:id
 * @method GET
 * @access public
-----------------------------------*/
module.exports.getSinglePostCtrl = asyncHandler(
    async (req, res) => {
        const post = await Post.findById(req.params.id).populate("user", ["-password"]).populate("comments")
        if(!post){
            return res.status(404).json({message:"post not found"})
        }
        res.status(200).json(post)
    }
)

/**--------------------------------
 * @description Get Posts Count
 * @route /api/posts/count
 * @method GET
 * @access public
-----------------------------------*/
module.exports.getPostsCountCtrl=asyncHandler(
    async (req, res) => {
        const count=await Post.countDocuments();
        res.status(200).json(count)
    }
)

/**--------------------------------
 * @description Delete Post
 * @route /api/posts/:id
 * @method DELETE
 * @access private (only admin or owner of the post)
-----------------------------------*/
module.exports.deletePostCtrl=asyncHandler(
    async (req, res) => {
        const post=await Post.findById(req.params.id)
        if(!post){
            return res.status(404).json({message:"post not found"})
        }
        if(req.user.isAdmin||req.user.id===post.user.toString()){
            await Post.findByIdAndDelete(req.params.id)
            await cloudinaryRemoveImage(post.image.publicId)
            await Comment.deleteMany({postId:post._id})
            res.status(200).json({message:"post has been deleted successfully",postId:post._id})
        }
        else{
            res.status(403).json({message:"access denied , forbidden"})
        }
    }
)

/**--------------------------------
 * @description Update Post
 * @route /api/posts/:id
 * @method PUT
 * @access private (only owner of the post)
-----------------------------------*/
module.exports.updatePostCtrl=asyncHandler(
    async (req, res) => {
        const { error } = validateUpdatePost(req.body)
        if (error) {
            return res.status(400).json(error.details[0].message)
        }
        const post=await Post.findById(req.params.id)
        if(!post){
            return res.status(404).json({message:"post not found"})
        }
        if(req.user.id!==post.user.toString()){
            return res.status(403).json({message:"access denied , forbidden"})
        }
        const updatedPost=await Post.findByIdAndUpdate(req.params.id,{
            $set:{
                title:req.body.title,
                description:req.body.description,
                category:req.body.category
            }
        },{new:true}).populate("user",["-password"])
        res.status(200).json(updatedPost)
    }
)

/**--------------------------------
 * @description Update Post Image
 * @route /api/posts/upload-image/:id
 * @method PUT
 * @access private (only owner of the post)
-----------------------------------*/
module.exports.updatePostImageCtrl=asyncHandler(
    async (req, res) => {
        if (!req.file) {
            return res.status(400).json({ message: "no image provided" })
        }
        const post=await Post.findById(req.params.id)
        if(!post){
            return res.status(404).json({message:"post not found"})
        }
        if(req.user.id!==post.user.toString()){
            return res.status(403).json({message:"access denied , forbidden"})
        }
        await cloudinaryRemoveImage(post.image.publicId);
        const imagePath = path.join(__dirname, `../images/${req.file.filename}`)
        const result = await cloudinaryUploadImage(imagePath);


        const updatedPost=await Post.findByIdAndUpdate(req.params.id,{
            $set:{
                image:{
                    url:result.secure_url,
                    publicId:result.public_id
                }
            }
        },{new:true}).populate("user",["-password"])
        res.status(200).json(updatedPost)
        fs.unlinkSync(imagePath)
    }
)

/**--------------------------------
 * @description Toggle Like
 * @route /api/posts/like/:id
 * @method PUT
 * @access private (only logged in user)
-----------------------------------*/
module.exports.toggleLikeCtrl=asyncHandler(
    async (req, res) => {
        let post=await Post.findById(req.params.id)
        if(!post){
            return res.status(404).json({message:"post not found"})
        }
        const isPostAlreadyLiked=post.likes.find((user)=>user.toString()===req.user.id)
        if(isPostAlreadyLiked){
            post=await Post.findByIdAndUpdate(req.params.id,{
                $pull:{
                    likes:req.user.id
                }
            },{new:true})
        }
        else{
            post=await Post.findByIdAndUpdate(req.params.id,{
                $push:{
                    likes:req.user.id
                }
            },{new:true})
        }
        res.status(200).json(post)
    }
)

