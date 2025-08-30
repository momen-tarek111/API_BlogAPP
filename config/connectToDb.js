const mongoose=require("mongoose")

module.exports=async ()=>{
    try {
        mongoose.connect(process.env.MONGO_CLOUD_URL)
        console.log("connected to MongoDB ^_^")
    } catch (error) {
        console.log("Connected failed to mongodb...",error)
    }
}