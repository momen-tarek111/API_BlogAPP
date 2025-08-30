const bcrypt = require("bcryptjs")
const asyncHandler = require("express-async-handler")
const fs=require("fs")
const path=require("path")
const { cloudinaryUploadImage, cloudinaryRemoveImage, cloudinaryRemoveMultipleImage } = require("../utils/cloudinary")
const { User,validateUpdateUser } = require("../models/User")
const { Post } = require("../models/Post")
const {Comment}=require ("../models/Comment")


/**--------------------------------
 * @description Get All Users
 * @route /api/users/profile
 * @method GET
 * @access private (only admin)
-----------------------------------*/
module.exports.getAllUsersCtrl=asyncHandler(
    async (req, res) => {
        const users=await User.find().populate("posts")
        res.status(200).json(users)
    }
)


/**--------------------------------
 * @description Get User Profile
 * @route /api/users/profile/:id
 * @method GET
 * @access public
-----------------------------------*/
module.exports.getUsersProfileCtrl=asyncHandler(
    async (req, res) => {
        const user=await User.findById(req.params.id).select("-password").populate("posts")
        if(user){
            res.status(200).json(user)
        }
        else{
            res.status(404).json({message:"User not found"})
        }
    }
)


/**
 * @description Update User Profile
 * @route /api/users/profile/:id
 * @method Put
 * @access private (only user himself)
*/
module.exports.updateUserProfileCtrl=asyncHandler(
    async (req, res) => {
        const { error } = validateUpdateUser(req.body)
        if (error) {
            return res.status(400).json(error.details[0].message)
        }
        if(req.body.password){
            const salt=await bcrypt.genSalt(10)
            req.body.password=await bcrypt.hash(req.body.password,salt)
        }
        const user = await User.findByIdAndUpdate(req.params.id, {
            $set: {
                username: req.body.username,
                password: req.body.password,
                bio:req.body.bio
            }
        }, { new: true }).select("-password").populate("posts")
        res.status(200).json(user)
    }
)

/**--------------------------------
 * @description Get Users Count
 * @route /api/users/count
 * @method GET
 * @access private (only admin)
-----------------------------------*/
module.exports.getUsersCountCtrl=asyncHandler(
    async (req, res) => {
        const count=await User.countDocuments();
        res.status(200).json(count)
    }
)

/**--------------------------------
 * @description Profile Photo Upload
 * @route /api/users/profile/profile-photo-upload
 * @method POST
 * @access private (only logged in user)
-----------------------------------*/
module.exports.profilePhotoUploadCtrl=asyncHandler(
    async (req, res) => {
        if(!req.file){
           return res.status(400).json({message:"no file provided"})
        }
        const imagePath=path.join(__dirname,`../images/${req.file.filename}`)
        const result=await cloudinaryUploadImage(imagePath);
        const user=await User.findById(req.user.id);
        if(user.profilePhoto.publicId!==null){
            await cloudinaryRemoveImage(user.profilePhoto.publicId);
        }
        user.profilePhoto={
            url:result.secure_url,
            publicId:result.public_id
        }
        await user.save();
        res.status(200).json({
            message:"your profile photo uploaded successfully",
            profilePhoto:{
                url:result.secure_url,
                publicId:result.public_id
            }
        })
        fs.unlinkSync(imagePath)
    }
)


/**--------------------------------
 * @description Delete User Profile (Account)
 * @route /api/users/profile/:id
 * @method DELETE
 * @access private (only admin and user himself)
-----------------------------------*/

module.exports.deleteUserProfileCtrl=asyncHandler(
    async (req, res) => {
        //1
        const user=await User.findById(req.params.id)
        if(!user){
            res.status(404).json({message:"User not found"})
        }
        //2
        const posts=await Post.find({user:user._id});
        //3
        const publicIds=posts?.map(post=>post.image.publicId)
        //4
        if(publicIds?.length>0){
            await cloudinaryRemoveMultipleImage(publicIds)
        }
        //5
        if(user.profilePhoto.publicId){
            await cloudinaryRemoveImage(user.profilePhoto.publicId);
        }
        await Post.deleteMany({user:user._id})

        await Comment.deleteMany({user:user._id})

        await User.findByIdAndDelete(req.params.id)

        res.status(200).json({message:"your profile has been deleted"})
    }
)