import bcrypt from "bcrypt";
import User from "../Models/User.Model.js";
import { registerValidation } from "../validation/auth.validation.js";
import redis from "../redis.js";
import { verifyMail } from "../verifyEmail.js";
import { fileUpload } from "../Utils/cloudinary.js";
import jwt from "jsonwebtoken";
import "dotenv/config";

// REGISTER
const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    // const avatar = req.file;

    const errorMessage = registerValidation({ fullName, email, password });
    if (errorMessage)
      return res.status(400).json({ success: false, message: errorMessage });

    const normalizedEmail = email.toLowerCase();
    const emailTaken = await User.findOne({ email: normalizedEmail });
    if (emailTaken)
      return res.status(409).json({
        success: false,
        message: `${emailTaken.email} is already registered`,
      });

    // const avatarImg = await fileUpload(avatar);

    await User.create({
      fullName: fullName.toLowerCase(),
      email: normalizedEmail,
      password,
      // avatar: {
      //   url: avatarImg.url,
      //   public_id: avatarImg.public_id,
      // },
    });
    return res
      .status(201)
      .json({ success: true, message: `${fullName} user has been created` });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not create the user",
      error: error.message,
    });
  }
};

// send verified email
const sendEmail = async (req, res) => {
try {
     const userId = req.user._id

     if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified",
      });
    }

    // Create verification token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      "EMAIL_SECRET",
      { expiresIn: "15min" }
    );

    console.log(token)

    const verifyLink = `http://localhost:9999/verifylink?userToken=${token}`;

    await verifyMail(verifyLink, user.email)

     return res.status(200).json({
      success: true,
      message: "Verification email sent successfully",
    });

} catch (error) {
  return res.status(500).json({
      success: false,
      message: "Failed to send verification email",
      error: error.message,
    });
}
}

// verifiy Email
const verifyEmail = async (req, res) => {
  try {

    const { userToken } = req.query;

    if (!userToken) {
      return res.status(400).json({
        success: false,
        message: "Verification token missing",
      });
    }

    // Verify token
    const decoded = jwt.verify(userToken, "EMAIL_SECRET");

    // Find user
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Already verified check (optional but good)
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
};

// LOGIN
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email.trim() || !password.trim())
    return res
      .status(400)
      .json({ success: false, message: "Email and password required" });

  const isUser = await User.findOne({ email }).select("+password");
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

  return res.status(200).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
      success: false,
      message: "Failed to change password",
      error: error.message,
    });
  }
};

// EXPORT SECURELY
export {
  registerUser,
  sendEmail,
  verifyEmail,
  loginUser,
  logOut,
  forgotPassword,
  changePassword,
  refreshToken,
};
