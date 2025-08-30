const mongoose = require("mongoose")
const Joi = require('joi');
const jwt=require("jsonwebtoken")
const passwordComplexity=require("joi-password-complexity")
const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 100,
        unique: true
    },
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8,
    },
    profilePhoto:{
        type:Object,
        default:{
            url:"https://cdn.pixabay.com/photo/2017/11/10/05/48/user-2935527_1280.png",
            publicId:null
        }
    },
    bio:{
        type:String
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isAccountVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON:{ virtuals:true},
    toObject:{ virtuals:true}
})

UserSchema.virtual("posts",{
    ref:"Post",
    foreignField:"user",
    localField:"_id",
})
UserSchema.methods.generateToken=function(){
    return jwt.sign({id:this._id,isAdmin:this.isAdmin},process.env.SECRET_KEY)
}

const User = mongoose.model("User", UserSchema)

function validateRegisterUser(obj) {
    const schema = Joi.object({
        email: Joi.string().trim().min(5).max(100).required().email(),
        username: Joi.string().trim().min(2).max(200).required(),
        password: passwordComplexity().required()
    })
    return schema.validate(obj)
}
function validateLoginUser(obj) {
    const schema = Joi.object({
        email: Joi.string().min(5).trim().max(100).email().required(),
        password: passwordComplexity().required()
    })
    return schema.validate(obj)
}
function validateUpdateUser(obj) {
    const schema = Joi.object({
        username: Joi.string().min(2).trim().max(100),
        password: passwordComplexity(),
        bio:Joi.string()
    })
    return schema.validate(obj)
}

function validateEmail(obj) {
    const schema = Joi.object({
        email: Joi.string().min(5).trim().max(100).email().required()
    })
    return schema.validate(obj)
}

function validateNewPassword(obj) {
    const schema = Joi.object({
        password: passwordComplexity().required()
    })
    return schema.validate(obj)
}
module.exports = {
    User,
    validateRegisterUser,
    validateLoginUser,
    validateUpdateUser,
    validateEmail,
    validateNewPassword
}
