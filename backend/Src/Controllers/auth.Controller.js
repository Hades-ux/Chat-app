import asyncHandler from "../Utils/asyncHandler.js";
import cookieOptions from "../Utils/cookiesOptions.js";
import {
  forgotPasswordService,
  loginUserService,
  refreshTokenService,
  registerUserService,
  sendForgotPasswordEmailService,
  sendVerifyEmailService,
  verifyUserService,
} from "../service/auth.Service.js";

// REGISTER
const register = asyncHandler(async (req, res) => {
  const { email, fullName, password } = req.body;

  const createUser = await registerUserService({
    fullName,
    email,
    password,
  });

  return res.status(201).json({
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

  return res.status(200).json({
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
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

// REFRESH TOKEN
const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;

  const { accessToken, refreshToken } = await refreshTokenService(token);

  res.cookie("accessToken", accessToken, cookieOptions);
  res.cookie("refreshToken", refreshToken, cookieOptions);

  return res.status(200).json({
    success: true,
    message: "Token is updated",
  });
});

// send verified email
const sendVerificationEmail = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const email = req.user.email;

  await sendVerifyEmailService({ email, userId });

  return res.status(200).json({
    success: true,
    message: `Verification link sent to ${email}`,
  });
});

// verifiy Email
const verifyUser = asyncHandler(async (req, res) => {
  const { token } = req.params;

  await verifyUserService({ token });

  return res.status(200).json({
    success: true,
    message: "Verified successfully",
  });
});

// send forgotpassword email
const sendForgotPasswordEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  await sendFrogotPasswordEmailService({ email });

  return res.status(200).json({
    success: true,
    message: `Forgot password link sent to ${email}`,
  });
});

// FORGOT PASSWORD
const forgotPassword = asyncHandler(async (req, res) => {
  const { newPassword, confirmNewPassword } = req.body;
  const { token } = req.params;

  await forgotPasswordService({ newPassword, confirmNewPassword, token });

  return res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});

// CHANGE PASSWORD (Authenticated user)
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user._id;

  await forgotPasswordService({ newPassword, oldPassword, userId });

  return res.status(200).json({
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
  verifyUser,
  sendForgotPasswordEmail,
  forgotPassword,
  changePassword,
};
