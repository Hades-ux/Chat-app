import { Router } from "express";
import {
  changePassword,
  forgotPassword,
  loginUser,
  logOut,
  refreshToken,
  registerUser,
} from "../Controllers/auth.Controller.js";
import { upload } from "../Middlewares/multer.Middleware.js";
import { authMiddleware } from "../Middlewares/jwt.Middleware.js";
import { validate } from "../Middlewares/validation.Middleware.js";
import { registerValidation } from "../validation/auth.validation.js";

const router = Router();

// register user
router.post(
  "/register", validate(registerValidation),
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  registerUser
);

// Login user
router.post("/login", loginUser);

// Logout user
router.post("/logout", authMiddleware, logOut);

// Forgot password
router.patch("/forgot-password", forgotPassword);

// Change password
router.patch("/change-password", authMiddleware, changePassword);

// Refresh token
router.patch("/refresh-token", refreshToken);

export default router;
