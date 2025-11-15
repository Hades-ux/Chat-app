import { Router } from "express";
import { authMiddleware } from "../Middlewares/jwt.Middleware.js";
import {
  createMessage,
  fetchMessage,
} from "../Controllers/message.Controller.js";

const router = Router();

// creat message
router.post("/create/:id", authMiddleware, createMessage);

// fetch Message
router.get("/fetch", authMiddleware, fetchMessage);

export default router;
