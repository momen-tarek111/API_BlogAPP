const express=require("express")
const hpp=require("hpp")
const helmet=require("helmet")
const connectToDb=require("./config/connectToDb")
const { notFound, errorHandler } = require("./middlewares/errors")
const cors =require("cors")
const rateLimit=require("express-rate-limit")
require("dotenv").config()
//connect to Db
connectToDb()

//inti app

const app=express()

//middlewares

app.use(express.json())
app.use(helmet())
app.use(hpp())
app.use(rateLimit({
    windowsMs:10*60*1000,
    max:200
}))

// Cors Policy
app.use(cors({
    origin: "https://blog-app-five-gold.vercel.app/",
}))
//Routes

app.use("/api/auth",require("./routes/authRoutes"))
app.use("/api/users",require("./routes/usersRoutes"))
app.use("/api/posts",require("./routes/postsRoutes"))
app.use("/api/comments",require("./routes/commentsRoutes"))
app.use("/api/categories",require("./routes/categoriesRoutes"))
app.use("/api/password",require("./routes/passwordRoutes"))
app.use(notFound)
app.use(errorHandler)

//running the app 
const PORT=process.env.PORT

app.listen(PORT,()=>{console.log(`Server Running in ${process.env.NODE_ENV} mode on Port ${PORT}`)})