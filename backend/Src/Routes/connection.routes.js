import { Router } from "express";
import { authMiddleware } from "../Middlewares/jwt.Middleware.js";
import { validationMiddleware } from "../Middlewares/validation.Middleware.js";
import {
  addConnection,
  fetchConnection,
} from "../Controllers/connection.controller.js";

import { addConnectionValidation } from "../validation/connection.validation.js";

const router = Router();

// Add connection
router.post(
  "/connections",
  authMiddleware,
  addConnectionValidation,
  validationMiddleware,
  addConnection
);

// fetch connection
router.get("/connections", authMiddleware, fetchConnection);

export default router;
