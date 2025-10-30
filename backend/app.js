import express from "express";
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";

configDotenv();

const app = express();

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

// routes declaration
app.use("/api/v1/auth", authRouter )

export default app;
