import { Router } from "express";
import {
  changePassword,
  forgotPassword,
  loginUser,
  logOut,
  refreshToken,
  registerUserController,
  sendEmail,
  verifyEmail,
} from "../Controllers/auth.Controller.js";
import { upload } from "../Middlewares/multer.Middleware.js";
import { authMiddleware } from "../Middlewares/jwt.Middleware.js";
import { validationMiddleware }  from "../Middlewares/validation.Middleware.js";
import { registerUserValidation } from "../validation/auth.validation.js";

const router = Router();

// register user
// router.post(
//   "/register",
//   upload.single("avatar"),
//   validate(registerValidation),
//   registerUser
// );

router.post("/register", registerUserValidation ,validationMiddleware, registerUserController);

// send verify email
router.post("/send-verify-email", authMiddleware, sendEmail)

// verify email link
router.get(`/verify-email/:token`,verifyEmail )

// Login user
router.post("/login", loginUser);

// Logout user
router.post("/logout", authMiddleware, logOut);

// send forgot password link

// Forgot password
router.patch("/forgot-password/:token", forgotPassword);

// Change password
router.patch("/change-password", authMiddleware, changePassword);

// Refresh token
router.patch("/refresh-token", refreshToken);

export default router;
