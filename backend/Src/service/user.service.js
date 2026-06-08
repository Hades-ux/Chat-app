import ApiError from "../Utils/ApiError.js";
import User from "../Models/User.Model.js";
import generateRandomToken from "../Utils/generateRandomToken.js";
import changeEmail from "../template/emails/changeEmail.js";
import crypto from "crypto";
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
const updateUserAvatarService = async ({ avatarPath, userId }) => {
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
  if (!avatar?.secure_url || !avatar?.public_id) {
    throw new ApiError(502, "Failed to upload the profile picture");
  }

  const currentAvatarPublicId = currentUser?.avatar?.publicId;

  currentUser.avatar.url = avatar?.secure_url;
  currentUser.avatar.publicId = avatar?.public_id;

  await currentUser.save({ validateBeforeSave: false });

  if (currentAvatarPublicId) {
    try {
      await deleteUpload(currentAvatarPublicId);
    } catch (error) {
      console.error("Failed cleanup of previous avatar", {
        publicId: currentAvatarPublicId,
        error: error,
      });
    }
  }

  return {
    url: currentUser.avatar.url,
    publicId: currentUser.avatar.publicId,
  };
};

// for send change of email
const sendChangeEmailService = async ({ email, userId }) => {
  if (!email) {
    throw new ApiError(400, "Missing Email");
  }

  const normalizeEmail = email.toLowerCase().trim();

  if (!userId) {
    throw new ApiError(401, "Unauthorized request");
  }

  const currentUser = await User.findById(userId).select(
    "email pendingEmail changeEmailToken changeEmailTokenExpiry"
  );

  if (!currentUser) {
    throw new ApiError(404, "User not found");
  }

  if (currentUser.email === normalizeEmail) {
    throw new ApiError(400, "Can not use the same email");
  }

  if (currentUser.pendingEmail) {
    throw new ApiError(409, "Already have the change email request");
  }

  const isMatchEmail = await User.findOne({ email: normalizeEmail }).select(
    "email"
  );

  if (isMatchEmail) {
    throw new ApiError(400, `${email} is already registered`);
  }

  const token = await generateRandomToken();
  currentUser.changeEmailToken = token.hashedToken;
  currentUser.changeEmailTokenExpiry = Date.now() + 10 * 60 * 1000;

  currentUser.pendingEmail = normalizeEmail;
  await currentUser.save({ validateBeforeSave: false });

  try {
    await sendEmail(email, changeEmail(token.rawToken));
    return true;
  } catch (error) {
    currentUser.changeEmailToken = null;
    currentUser.changeEmailTokenExpiry = null;
    currentUser.pendingEmail = null;

    await currentUser.save({ validateBeforeSave: false });

    console.error("Failed to send change-email verification", error);

    throw new ApiError(500, "Failed to send change-email verification");
  }
};

const changeEmailService = async ({ token }) => {
  if (!token) {
    throw new ApiError(400, "token is missing");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    changeEmailToken: hashedToken,
    changeEmailTokenExpiry: { $gt: Date.now() },
  }).select("email pendingEmail changeEmailToken changeEmailTokenExpiry");

  if (!user) {
    throw new ApiError(400, "Expired or Invalid token");
  }

  if (!user.pendingEmail) {
    throw new ApiError(400, "No email to update");
  }

  const isTaken = await User.findOne({ email: user.pendingEmail });

  if (isTaken) {
    throw new ApiError(400, "Can not update the email,Email is already taken");
  }

  user.email = user.pendingEmail;
  user.pendingEmail = null;
  user.changeEmailToken = null;
  user.changeEmailTokenExpiry = null;
  await user.save();

  return {
    email: user.email,
  };
};

export {
  ownerProfileService,
  userProfileService,
  deleteUserService,
  updateUserAvatarService,
  sendChangeEmailService,
  changeEmailService,
};
