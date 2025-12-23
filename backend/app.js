import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";


const app = express();
app.use(
   cors({
    origin: "https://chat-app-six-delta-19.vercel.app",
    credentials: true,
  })
)
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended: true, limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is up and running",
  });
});

// routes import
import authRouter  from "./Src/Routes/auth.routes.js"
import userRouter from "./Src/Routes/user.routes.js"
import connectionRouter from "./Src/Routes/connection.routes.js"
import messageRouter from "./Src/Routes//message.route.js"

// routes declaration
app.use("/api/v1/auth", authRouter )
app.use("/api/v1/user", userRouter)
app.use("/api/v1/connection", connectionRouter)
app.use("/api/v1/message", messageRouter)

export default app;
