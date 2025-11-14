import { Router } from "express";
import { authMiddleware } from "../Middlewares/jwt.Middleware.js";
import {
  addConnection,
  fetchConnection,
} from "../Controllers/connection.controller.js";

const router = Router();

// Add connection
router.post("/add", authMiddleware, addConnection);

// fetch connection
router.get("/fetch", authMiddleware, fetchConnection);

export default router;
