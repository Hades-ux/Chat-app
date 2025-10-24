import express from "express";
import { configDotenv } from "dotenv";

configDotenv();
const app = express();

app.get("/", (req, res) => {
  res.status(200).json({
    sucesses: true,
    message: "Server is up and running",
  });
});

export default app;
