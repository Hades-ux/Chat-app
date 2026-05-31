import ApiError from "../Utils/apiErrorHandler.js";
import User from "../Models/User.Model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import generateRandomToken from "../Utils/generateRandomToken.js";
import sendEmail from "../Utils/sendEmail.js";
import crypto from "crypto";
import verifyUser from "../template/emails/verifyUser.js";

//for register(sign up) User
const registerUserService = async ({ email, password, fullName }) => {
  // normalize email
  const normalizedEmail = email.toLowerCase().trim();

  // check existing user
  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    throw new ApiError(409, "Email is already registered");
  }

  const userData = {
    fullName: fullName,
    password: password,
    email: normalizedEmail,
  };

  const creatUser = await User.create(userData);

  return creatUser;
};

//for login user
const loginUserService = async ({ email, password }) => {
  // normalize email
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isMatch = await user.isPasswordCorrect(password);

  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  user.save();

  const safeUser = user.toObject();
  delete safeUser.password;

  return {
    safeUser,
    accessToken,
    refreshToken,
  };
};

//for refresh token rotation
const refreshTokenService = async ({ token }) => {
  if (!token) {
    throw new ApiError(401, "Refresh token is missing");
  }

  const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

  const user = await User.findById(decoded?._id);

  if (!user) {
    throw new ApiError(401, "User not found");
  }

  if (token != user.refreshToken) {
    throw new ApiError(403, "Invalid or expired refresh token");
  }

  const newAccessToken = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  return {
    newAccessToken,
    newRefreshToken,
  };
};

// for sending forgot password email
const sendForgotPasswordEmailService = async ({ email }) => {};

// for forgot password
const forgotPasswordService = async ({ password, samePassword, token }) => {
  if (!newPassword) {
    throw new ApiError(400, "New password is required");
  }

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isSamePassword = await user.isPasswordCorrect(newPassword);

  if (isSamePassword) {
    throw new ApiError(
      400,
      "New password must be different from current password"
    );
  }

  user.password = newPassword;
  await user.save();

  return true;
};

// for changePassword
const changePasswordService = async ({ oldPassword, newPassword, userId }) => {
  if (!userId) {
    throw new ApiError(404, "User data is missing");
  }

  const currentUser = await User.findById(userId);

  const isMatch = await currentUser.isPasswordCorrect(oldPassword);

  if (!isMatch) {
    throw new ApiError(400, "Old password is incorrect");
  }

  const isSamePassword = await currentUser.isPasswordCorrect(newPassword);

  if (isSamePassword) {
    throw new ApiError(400, "New password must be different from old password");
  }

  currentUser.password = newPassword;
  await currentUser.save();

  return true;
};

//for sendingVerifyEmail
const sendVerifyEmailService = async ({ email, userId }) => {
  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  if (!userId) {
    throw new ApiError(404, "User data is missing");
  }

  const currentUser = await User.findById(userId);

  if (!currentUser) {
    throw new ApiError(404, "User not found");
  }

  if (currentUser.isVerified) {
    throw new ApiError(400, "User already verified");
  }

  const token = generateRandomToken();

  currentUser.verifyToken = token.hashedToken;
  currentUser.verifyTokenExpiry = Date.now() + 10 * 60 * 1000;

  await currentUser.save({ validateBeforeSave: false });

  try {
    await sendEmail(email, verifyUser(token.rawToken));
    currentUser.emailVerifyToken = undefined;
    currentUser.emailVerifyTokenExpiry = undefined;
    return true;
  } catch {
    currentUser.emailVerifyToken = undefined;
    currentUser.emailVerifyTokenExpiry = undefined;
    await currentUser.save({ validateBeforeSave: false });
    throw new ApiError(500, "Failed to send verification email");
  }
};

//for verifyEmail
const verifyUserService = async ({ token }) => {
  if (!token) {
    throw new ApiError(404, "Data is missing");
  }

  const incommingHashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const currentUser = await User.findOne({
    verifyToken: incommingHashedToken,
    verifyTokenExpiry: { $gt: Date.now() },
  });

  if (!currentUser) {
    throw new ApiError(400, "Invalid or expired token");
  }

  if (currentUser.isVerified) {
    throw new ApiError(400, "User is already verified");
  }

  currentUser.isVerified = true;
  currentUser.verifyToken = undefined;
  currentUser.verifyTokenExpiry = undefined;
  await currentUser.save({ validateBeforeSave: false });

  return true;
};

export {
  registerUserService,
  loginUserService,
  refreshTokenService,
  sendForgotPasswordEmailService,
  forgotPasswordService,
  changePasswordService,
  sendVerifyEmailService,
  verifyUserService,
};
