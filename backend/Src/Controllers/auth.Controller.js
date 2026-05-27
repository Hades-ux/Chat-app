import bcrypt from "bcrypt";
import User from "../Models/User.Model.js";
import cookieOptions from "../Utils/cookiesOptions.js";
import asyncHandler from "../Utils/asyncHandler.js";
import { registerUserValidation } from "../validation/auth.validation.js";
import {
  forgotPasswordService,
  loginUserService,
  refreshTokenService,
  registerUserService,
  sendVerifyEmailService,
} from "../service/auth.Service.js";

import jwt from "jsonwebtoken";
import "dotenv/config";

// REGISTER
const register = asyncHandler(async (req, res) => {
  const { email, fullName, password } = req.body;

  const createUser = await registerUserService({
    fullName,
    email,
    password,
  });

  res.status(201).json({
    success: true,
    message: "User has been created",
    data: {
      userName: createUser.fullName,
      email: createUser.email,
    },
  });
});

// LOGIN
const logIn = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } = await loginUserService({
    email,
    password,
  });

  res.cookie("accessToken", accessToken, cookieOptions);
  res.cookie("refreshToken", refreshToken, cookieOptions);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
    },
  });
});

// LOGOUT
const logOut = asyncHandler(async (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

// REFRESH TOKEN
const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookie.refreshToken;

  const { accessToken, refreshToken } = await refreshTokenService(token);

  res.cookie("Access Token", accessToken, cookieOptions);
  res.cookie("Refresh Token", refreshToken, cookieOptions);

  res.status(200).json({
    success: true,
    message: "Token is updated",
  });
});

// send verified email
const sendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const userId = req.user._id;

  await sendVerifyEmailService({ email, userId });

  res.status(200).json({
    success: true,
    message: `Verification link sent to ${email}`,
  });
});

// verifiy Email
const verifyEmail = asyncHandler(async (req, res) => {
  try {
    const { userToken } = req.query;

    if (!userToken) {
      return res.status(400).json({
        success: false,
        message: "Verification token missing",
      });
    }

    // Verify token
    const decoded = jwt.verify(userToken, process.env.EMAIL_SECRET);

    // Find user
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Already verified check
    if (user.isVerified) {
      return res.status(200).json({
        success: true,
        message: "Email already verified",
      });
    }

    user.isVerified = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired verification token",
    });
  }
});

// FORGOT PASSWORD
const forgotPassword = asyncHandler(async (req, res) => {
  const { email, newPassword } = req.body;

  await forgotPasswordService({email, newPassword});

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});

// CHANGE PASSWORD (Authenticated user)
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user._id;

  await forgotPasswordService({ newPassword, oldPassword, userId });

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

export {
  register,
  logIn,
  logOut,
  refreshToken,
  sendVerificationEmail,
  verifyEmail,
  forgotPassword,
  changePassword,
};
