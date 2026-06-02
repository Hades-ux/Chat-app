import ApiError from "../Utils/ApiError.js";
import User from "../Models/User.Model.js";
import { deleteUpload, fileUpload } from "../Utils/cloudinary.js";

// for Owner Profile
const ownerProfileService = async ({ userId }) => {
  if (!userId) {
    throw new ApiError(401, "Unauthorized request");
  }

  const currentUser = await User.findById(userId)
    .select("fullName email createdAt isVerified avatar")
    .lean();

  if (!currentUser) {
    throw new ApiError(404, "User not found");
  }

  return currentUser;
};

// for user profile
const userProfileService = async ({ userId }) => {
  if (!userId) {
    throw new ApiError(400, "user data  is missing");
  }

  const user = await User.findById(userId)
    .select("fullName email createdAt isVerified avatar")
    .lean();

  if (!currentUser) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

// for delet owner profile
const deleteUserService = async ({ userId }) => {
  if (!userId) {
    throw new ApiError(401, "Unauthorized request");
  }

  await User.findByIdAndDelete({ userId });

  return true;
};

// for uploading profile picture
const UpdateUserAvatarService = async ({ avatarPath, userId }) => {
  if (!userId) {
    throw new ApiError(401, "Unauthorized request");
  }

  if (!avatarPath) {
    throw new ApiError(400, "Image is missing");
  }

  const currentUser = await User.findById(userId);

  if (!currentUser) {
    throw new ApiError(404, "User not found");
  }

  const avatar = await fileUpload(avatarPath);
  if (!avatar) {
    throw new ApiError(500, "Failed to upload the profile picture");
  }

  const currentAvatar = currentUser?.avatar?.publicId;
  
  currentUser.avatar.url = avatar.secure_url;
  currentUser.avatar.publicId = avatar.public_id;

  await currentUser.save({ validateBeforeSave: false });

  if (currentAvatar) {
    try {
      await deleteUpload(currentAvatar);
    } catch (error) {
      console.log(error);
      throw new ApiError(500, "Not able to delete current Profile picture");
    }
  }

  return true;
};

export {
  ownerProfileService,
  userProfileService,
  deleteUserService,
  UpdateUserAvatarService,
};
