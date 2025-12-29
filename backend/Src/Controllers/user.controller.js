import { fileUpload, deleteUpload } from "../Utils/cloudinary.js";
import User from "../Models/User.Model.js";

// OWNER PROFILE
const ownerProfile = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    //Fetch from DB
    const user = await User.findById(userId).select("-password -refreshToken");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User Not Found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User Found",
      data: user?._id,
      user,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
  }
};

// USER PROFILE
const userProfile = async (req, res) => {
  try {
    const userId = req.params.id; 

    const user = await User.findById(userId).select(
      "-password -refreshToken"
    );

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


// UPDATE USERNAME
const updateUserName = async (req, res) => {
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
};

// UPDATE AVATAR
const UpdateUserAvatar = async (req, res) => {
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

    // Delete old avatar
    if (user.avatar?.public_id) {
      await deleteUpload(user.avatar.public_id);
    }

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
};

// UPDATE EMAIL
const UpdateUserEmail = async (req, res) => {
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

// DELETE USER
const deleteUser = async (req, res) => {
  try {
    const userId = req.user._id;

    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      success: true,
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

export {
  ownerProfile,
  userProfile,
  updateUserName,
  UpdateUserAvatar,
  UpdateUserEmail,
  deleteUser,
};
