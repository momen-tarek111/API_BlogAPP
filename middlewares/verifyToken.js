const jwt = require("jsonwebtoken")
const verifyToken=(req,res,next)=>{
    const authToken=req.headers.authorization;
    if(authToken){
        const token=authToken.split(" ")[1];
        try {
            const decode=jwt.verify(token,process.env.SECRET_KEY);
            req.user=decode;
            next()
        }catch (error) {
            return res.status(401).json({message:"invalid token"})
        }
    }
    else{
        return res.status(401).json({message:"no token provided , access denied"})
    }
}
const verifyTokenAndAdmin=(req,res,next)=>{
    verifyToken(req,res,()=>{
        if(req.user.isAdmin){
            next()
        }
        else{
            return res.status(403).json({message:"You are not allowed, only admin allowed"})
        }
    })
}
const verifyTokenAndOnlyUser=(req,res,next)=>{
    verifyToken(req,res,()=>{
        if(req.user.id===req.params.id){
            next()
        }
        else{
            return res.status(403).json({message:"You are not allowed, only user himself"})
        }
    })
}
const verifyTokenAndAuthorization=(req,res,next)=>{
    verifyToken(req,res,()=>{
        if(req.user.id===req.params.id||req.user.isAdmin){
            next()
        }
        else{
            return res.status(403).json({message:"You are not allowed, only user himself or admin"})
        }
    })
}
module.exports={
    verifyToken,
    verifyTokenAndAdmin,
    verifyTokenAndOnlyUser,
    verifyTokenAndAuthorization
}