import bcrypt from "bcrypt";
import User from "../Models/User.Model.js";
import cookieOptions from "../Utils/cookiesOptions.js";
import { registerUserValidation } from "../validation/auth.validation.js";
import { verifyMail } from "../Utils/verifyEmail.js";
import { fileUpload } from "../Utils/cloudinary.js";
import { asyncHandler } from "../Utils/asyncHandler.js"
import { loginUserService, registerUserService } from "../service/auth.Service.js";

import jwt from "jsonwebtoken";
import "dotenv/config";

// REGISTER
const registerUserController = asyncHandler(async(req, res) =>{

  const { email, fullName, password } = req.body;

  const createUser = await registerUserService ({
    fullName,
    email,
    password,
  });

  res.status(201).json({
    success: true,
    message: "User has been created",
    data: {
      userName: createUser.fullName,
      email: createUser.email
    }
  });

}

)

// LOGIN
const loginUserController = asyncHandler( async (req, res) => {
  const { email, password } = req.body;

 const { user, accessToken, refreshToken } = await loginUserService({ email, password });
    
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
}
)

// send verified email
const sendEmail = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const user = await User.findById(userId);

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
      process.env.EMAIL_SECRET,
      { expiresIn: "15min" }
    );

    console.log(token);

    const verifyLink = `${process.env.TEST}/verifylink?userToken=${token}`;

    await verifyMail(verifyLink, user.email);

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
};

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
};




// LOGOUT
const logOut = async (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};


// REFRESH TOKEN
const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token)
      return res.status(401).json({
        success: false,
        message: "Refresh token missing",
      });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    const user = await User.findById(decoded._id);
    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
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

export {
  registerUserController,
  sendEmail,
  verifyEmail,
  loginUser,
  logOut,
  forgotPassword,
  changePassword,
  refreshToken,
};
