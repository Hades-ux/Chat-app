import { Router } from "express";
import { authMiddleware } from "../Middlewares/jwt.Middleware.js";
import { validationMiddleware } from "../Middlewares/validation.Middleware.js";
import {
  changePassword,
  forgotPassword,
  logIn,
  logOut,
  refreshToken,
  register,
  sendForgotPasswordEmail,
  sendVerificationEmail,
  verifyUser,
} from "../Controllers/auth.Controller.js";
import {
  changePasswordValidation,
  forgotPasswordValidation,
  loginUserValidation,
  registerUserValidation,
  sendForgotPasswordEmailValidation,
  verifyUserValidation,
} from "../validation/auth.validation.js";

const router = Router();

//register user
router.post(
  "/register",
  registerUserValidation,
  validationMiddleware,
  register
);

// send verify email link
router.post(
  "/send-verify-email",
  authMiddleware,
  validationMiddleware,
  sendVerificationEmail
);

// verify email
router.get(
  "/verify-email/:token",
  verifyUserValidation,
  validationMiddleware,
  verifyUser
);

// Login user
router.post("/login", loginUserValidation, validationMiddleware, logIn);

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
