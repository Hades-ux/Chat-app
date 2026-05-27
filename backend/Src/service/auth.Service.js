import ApiError  from "../Utils/apiErrorHandler.js";
import User from "../Models/User.Model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import generateToken from "../Utils/genrateToken.js";
import sendEmail from "../Utils/sendEmail.js";

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

// for forgot password
const forgotPasswordService = async ({ newPassword, user }) => {
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
const sendingVerifyEmailService = async ({ email, userId }) => {
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

  const token = generateToken();

  currentUser.verifyToken = token.hashedToken;
  currentUser.verifyTokenExpiry = Date.now() + 10 * 60 * 1000;

  await currentUser.save({ validateBeforeSave: false });

  try {
    await sendEmail(token.rawToken, email);
    return true;
  } catch {
    currentUser.verifyToken = undefined;
    currentUser.verifyTokenExpiry = undefined;
    await currentUser.save({ validateBeforeSave: false });
    return false;
  }
};

//for verifyEmail
const verifyEmailService = async ({}) => {};

export {
  registerUserService,
  loginUserService,
  refreshTokenService,
  forgotPasswordService,
  changePasswordService,
  sendingVerifyEmailService,
  verfyEmailService,
};
