import { fileUpload, deleteUpload } from "../Utils/cloudinary.js";
import User from "../Models/User.Model.js";
import redis from "../redis.js"
// owner Profile
const ownerProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user?._id).select(
      "-password, -refreshToken"
    );
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User Not Find.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User Found",
      user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// user Profile
const userProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select("-password -refreshToken");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// updtae userName
const updateUserName = async (req, res) => {
  try {
    const { newUserName } = req.body;

    if (!newUserName)
      return res.status(400).json({
        success: false,
        message: "User Name field can not be empty",
      });

    const existingUser = await User.findOne({ userName: newUserName });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username already taken",
      });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $set: { userName: newUserName },
    });

    return res.status(200).json({
      success: true,
      message: `Username updated successfully to ${newUserName}`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "internal server error",
      error: error.message,
    });
  }
};

// update Avatar
const UpdateUserAvatar = async (req, res) => {
  try {
    // recive file
    const newAvatarPath = req.file?.path;

    // validate file path
    if (!newAvatarPath)
      return res.status(400).json({
        success: false,
        message: "File not found",
      });

    // upload file to Cloudinary
    const newAvatar = await fileUpload(newAvatarPath);
    if (!newAvatar)
      return res.status(400).json({
        success: false,
        message: "Error during uploading Image",
      });

    // find User
    const user = await User.findById(req.user._id);

    // validate user
    if (!user)
      return res.status(400).json({
        success: false,
        message: "user not found",
      });

    // delete file from cloudnry
    if (user.avatar?.public_id) {
      await deleteUpload(user.avatar.public_id);
    }

    // replace old data with new data
    await User.findByIdAndUpdate(req.user._id, {
      $set: {
        avatar: { url: newAvatar.secure_url, public_id: newAvatar.public_id },
      },
    });

    // response
    return res.status(200).json({
      success: true,
      message: "Avatar updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server Error",
      error: error.message,
    });
  }
};

// Update Email
const UpdateUserEmail = async (req, res) => {
  try {
    const { newUserEmail } = req.body;

    if (!newUserEmail)
      return res.status(400).json({
        success: false,
        message: "Email filed cannot be empty",
      });

    const existingUser = await User.findOne({ email: newUserEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $set: { email: newUserEmail },
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
};

// delet user
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    return res.status(200).json({
      success: false,
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const userOnline = async (req, res) => {
  try {
    const userId = req.params.userId;

     // Get online status from Redis
    const status = await redis.get(`user:${userId}:online`);

    return res.status(200).json({
      success: true,
      userId,
      online: status === "online",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export {
  ownerProfile,
  userProfile,
  updateUserName,
  UpdateUserAvatar,
  UpdateUserEmail,
  deleteUser,
  userOnline,
};
