import User from "../Models/User.Model.js";
import asyncHandler from "../Utils/asyncHandler.js";
import ApiResponse from "../Utils/ApiResponse.js";
import { fileUpload, deleteUpload } from "../Utils/cloudinary.js";
import {
  deleteUserService,
  ownerProfileService,
  userProfileService,
} from "../service/user.service.js";

// OWNER PROFILE
const ownerProfile = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const user = await ownerProfileService({ userId });

  const profile = {
    _id: user._id,
    fullName: user.fullName,
    avatar: user.avatar?.url,
    isVerified: user.isVerified,
    email: user.email,
    createdAt: user.createdAt.toISOString().split("T")[0],
  };

  return res.status(200).json(new ApiResponse("Data fetched", profile));
});

// USER PROFILE
const userProfile = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  const user = await userProfileService({ userId });

  const profile = {
    _id: user._id,
    fullName: user.fullName,
    avatar: user.avatar?.url,
    isVerified: user.isVerified,
    email: user.email,
    createdAt: user.createdAt.toISOString().split("T")[0],
  };

  return res.status(200).json(new ApiResponse("Data fetched", profile));
});

// UPDATE USERNAME
const updateUserName = asyncHandler(async (req, res) => {
  try {
    const { newUserName } = req.body;

    if (!newUserName)
      return res.status(400).json({
        success: false,
        message: "User Name field cannot be empty",
      });

    const existingUser = await User.findOne({ userName: newUserName });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username already taken",
      });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $set: { fullName: newUserName },
    });

    return res.status(200).json({
      success: true,
      message: `Username updated successfully to ${newUserName}`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// UPDATE AVATAR
const UpdateUserAvatar = asyncHandler(async (req, res) => {
  try {
    const newAvatarPath = req.file?.path;
    if (!newAvatarPath)
      return res.status(400).json({
        success: false,
        message: "File not found",
      });

    const newAvatar = await fileUpload(newAvatarPath);
    if (!newAvatar)
      return res.status(400).json({
        success: false,
        message: "Error uploading image",
      });

    const user = await User.findById(req.user._id);
    if (!user)
      return res.status(400).json({
        success: false,
        message: "User not found",
      });

    await User.findByIdAndUpdate(req.user._id, {
      $set: {
        avatar: { url: newAvatar.secure_url, public_id: newAvatar.public_id },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Avatar updated successfully",
      avatar: {
        url: newAvatar.secure_url,
        public_id: newAvatar.public_id,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server Error",
      error: error.message,
    });
  }
});

// UPDATE EMAIL
const UpdateUserEmail = asyncHandler(async (req, res) => {
  try {
    const { newUserEmail } = req.body;

    if (!newUserEmail)
      return res.status(400).json({
        success: false,
        message: "Email field cannot be empty",
      });

    const existingUser = await User.findOne({ email: newUserEmail });
    if (existingUser)
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });

    await User.findByIdAndUpdate(req.user._id, {
      $set: { email: newUserEmail, isVerified: false },
    });

    return res.status(200).json({
      success: true,
      message: `Email updated successfully to ${newUserEmail}`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// DELETE USER
const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await deleteUserService({ userId });

  return res.status(200).json(ApiResponse("User deleted successfully"));
});

export {
  ownerProfile,
  userProfile,
  updateUserName,
  UpdateUserAvatar,
  UpdateUserEmail,
  deleteUser,
};
