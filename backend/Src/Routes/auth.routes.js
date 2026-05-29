import { Router } from "express";
import { authMiddleware } from "../Middlewares/jwt.Middleware.js";
import { validationMiddleware } from "../Middlewares/validation.Middleware.js";
import {
  changePassword,
  forgotPassword,
  loginUser,
  logOut,
  refreshToken,
  registerUserController,
  sendForgotPasswordEmail,
  sendVerificationEmail,
  verifyEmail,
} from "../Controllers/auth.Controller.js";
import {
  changePasswordValidation,
  forgotPasswordValidation,
  loginUserValidation,
  registerUserValidation,
  sendForgotPasswordEmailValidation,
  sendVerificationEmailValidation,
  verifyUserValidation,
} from "../validation/auth.validation.js";

const router = Router();

router.post(
  "/register",
  registerUserValidation,
  validationMiddleware,
  registerUserController
);

// send verify email
router.post(
  "/send-verify-email",
  authMiddleware,
  sendVerificationEmailValidation,
  validationMiddleware,
  sendVerificationEmail
);

// verify email link
router.get(
  "/verify-email/:token",
  verifyUserValidation,
  validationMiddleware,
  verifyEmail
);

// Login user
router.post("/login", loginUserValidation, validationMiddleware, loginUser);

// Logout user
router.post("/logout", authMiddleware, logOut);

// send forgot password link
router.post(
  "/send-forgot-password-email",
  sendForgotPasswordEmailValidation,
  validationMiddleware,
  sendForgotPasswordEmail
);

// Forgot password
router.patch(
  "/forgot-password/:token",
  forgotPasswordValidation,
  validationMiddleware,
  forgotPassword
);

// Change password
router.patch(
  "/change-password",
  changePasswordValidation,
  validationMiddleware,
  authMiddleware,
  changePassword
);

// Refresh token
router.patch("/refresh-token", validationMiddleware, refreshToken);

export default router;
