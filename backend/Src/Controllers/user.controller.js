import User from "../Models/User.Model.js";
import asyncHandler from "../Utils/asyncHandler.js";
import ApiResponse from "../Utils/ApiResponse.js";
import { fileUpload, deleteUpload } from "../Utils/cloudinary.js";
import {
  changeEmailService,
  deleteUserService,
  ownerProfileService,
  sendChangeEmailService,
  updateUserAvatarService,
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

// UPDATE AVATAR
const UpdateUserAvatar = asyncHandler(async (req, res) => {
  const newAvatarPath = req.file?.path;
  const userId = req.user._id;

  const avatar = await updateUserAvatarService({
    avatarPath: newAvatarPath,
    userId,
  });

  return res.status(200).json(
    new ApiResponse("Profile picture updated successfully.", {
      url: avatar.url,
      publicId: avatar.publicId,
    })
  );
});

// DELETE USER
const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await deleteUserService({ userId });

  return res.status(200).json(ApiResponse("User deleted successfully"));
});

// send change email
const sendChangeEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const userId = req.user._id;

  await sendChangeEmailService({ email, userId });

  return res
    .status(200)
    .json(new ApiResponse(`Email send successfully to ${email}`));
});

// UPDATE EMAIL
const UpdateUserEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const response = await changeEmailService({ token });

  return res
    .status(200)
    .json(new ApiResponse(`Email updated successfully to ${response.email}`));
});

// UPDATE USERNAME
// const updateUserName = asyncHandler(async (req, res) => {
//   try {
//     const { newUserName } = req.body;

//     if (!newUserName)
//       return res.status(400).json({
//         success: false,
//         message: "User Name field cannot be empty",
//       });

//     const existingUser = await User.findOne({ userName: newUserName });
//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: "Username already taken",
//       });
//     }

//     await User.findByIdAndUpdate(req.user._id, {
//       $set: { fullName: newUserName },
//     });

//     return res.status(200).json({
//       success: true,
//       message: `Username updated successfully to ${newUserName}`,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// });

export {
  ownerProfile,
  userProfile,
  updateUserName,
  UpdateUserAvatar,
  UpdateUserEmail,
  deleteUser,
  sendChangeEmail,
};
