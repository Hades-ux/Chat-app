import bcrypt from "bcrypt";
import User from "../Models/User.Model.js";
import { registerValidation } from "../validation/auth.validation.js";
import redis from "../redis.js";
import { verifyMail } from "../verifyEmail.js";
import { fileUpload } from "../Utils/cloudinary.js";

// REGISTER
const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const avatar = req.file

    const errorMessage = registerValidation({ fullName, email, password });
    if (errorMessage)
      return res.status(400).json({ success: false, message: errorMessage });

    const normalizedEmail = email.toLowerCase();
    const emailTaken = await User.findOne({ email: normalizedEmail });
    if (emailTaken)
      return res
        .status(409)
        .json({
          success: false,
          message: `${emailTaken.email} is already registered`,
        });

        const avatarImg = await fileUpload(avatar);

       const token = Math.floor(100000 + Math.random() * 900000);
       await redis.del(`OTP:${normalizedEmail}`);
       await redis.set(`OTP:${normalizedEmail}`, String(token),{EX:300})

      await  verifyMail(token,normalizedEmail)
    await User.create({
      fullName: fullName.toLowerCase(),
      email: normalizedEmail,
      password,
      avatar :{
        url: avatarImg.url,
        public_id: avatarImg.public_id
      }
    });
    return res
      .status(201)
      .json({ success: true, message: `${fullName} user has been created` });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Could not create the user",
        error: error.message,
      });
  }
};

// LOGIN
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email.trim() || !password.trim())
    return res
      .status(400)
      .json({ success: false, message: "Email and password required" });

  const isUser = await User.findOne({ email });
  if (!isUser)
    return res.status(404).json({ success: false, message: "User Not Found" });

  const verifyPassword = await isUser.isPasswordCorrect(password);
  if (!verifyPassword)
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });

  const accessToken = isUser.generateAccessToken();
  const refreshToken = isUser.generateRefreshToken();

  // Store refresh token in Redis
  await redis.set(`refresh:${refreshToken}`, isUser._id.toString(), {
    EX: 7 * 24 * 60 * 60,
  });

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
  res.cookie("accessToken", accessToken, cookieOptions);
  res.cookie("refreshToken", refreshToken, cookieOptions);

  return res
    .status(200)
    .json({
      success: true,
      message: "Login Successful",
      user: { userName: isUser.userName, id: isUser._id },
    });
};

// LOGOUT
const logOut = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) await redis.del(`refresh:${refreshToken}`);

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res
      .status(200)
      .json({ success: true, message: "Logout successful" });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Error during logout",
        error: error.message,
      });
  }
};

// REFRESH TOKEN
const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "No refresh token" });

    const userId = await redis.get(`refresh:${token}`);
    if (!userId)
      return res
        .status(403)
        .json({ success: false, message: "Invalid refresh token" });

    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    await redis.del(`refresh:${token}`);
    await redis.set(`refresh:${newRefreshToken}`, user._id.toString(), {
      EX: 7 * 24 * 60 * 60,
    });

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    return res.status(200).json({ success: true, message: "Token refreshed" });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to refresh token",
        error: error.message,
      });
  }
};

// FORGOT PASSWORD
const forgotPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword)
      return res
        .status(400)
        .json({ success: false, message: "Email and new password required" });

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to update password",
        error: error.message,
      });
  }
};

// CHANGE PASSWORD (Authenticated user)
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const isMatch = await user.isPasswordCorrect(oldPassword);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Old password incorrect" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to change password",
        error: error.message,
      });
  }
};

// EXPORT SECURELY
export {
  registerUser,
  loginUser,
  logOut,
  forgotPassword,
  changePassword,
  refreshToken,
};
