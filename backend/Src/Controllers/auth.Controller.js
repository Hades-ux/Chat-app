import { fileUpload } from "../Utils/cloudinary.js";
import bcrypt from "bcrypt";
import User from "../Models/User.Model.js";

// register
const registerUser = async (req, res) => {
  // recive user data from frontend
  const { firstName, lastName, email, password, userName } = req.body;

  // validation
  if (!firstName) {
    return res
      .status(400)
      .json({ success: false, message: "First Name is required" });
  }

  if (!lastName) {
    return res
      .status(400)
      .json({ success: false, message: "Last Name is required" });
  }

  if (!userName) {
    return res
      .status(400)
      .json({ success: false, message: "Username is required" });
  }

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid email format" });
  }

  if (!password) {
    return res
      .status(400)
      .json({ success: false, message: "Password is required" });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters",
    });
  }

  // check for already exist(email and userName)
  try {
    // check email separately
    const emailTaken = await User.findOne({ email });
    if (emailTaken) {
      return res.status(409).json({
        success: false,
        message: `${email} is already registered`,
      });
    }

    // check username separately
    const userNameTaken = await User.findOne({ userName });
    if (userNameTaken) {
      return res.status(409).json({
        success: false,
        message: `${userName} is already taken`,
      });
    }
    // check of avatar image file
    // const avatarImg = req.files?.avatar?.[0]?.path;
    // if (!avatarImg) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Avatar image is required",
    //   });
    // }

    // // upload avtar image
    // let uploadAvtarImg;
    // try {
    //   uploadAvtarImg = await fileUpload(avatarImg);
    // } catch (error) {
    //   return res.status(500).json({
    //     success: false,
    //     message: "Error during the file upload",
    //     error: error.message,
    //   });
    // }

    // save user in DB

    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      userName: userName.toLowerCase(),
      // avatar: {
      //   url: uploadAvtarImg.secure_url,
      //   public_id: uploadAvtarImg.public_id,
      // },
    });

    // return response
    return res.status(201).json({
      success: true,
      message: `${userName} user has been created`,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Could not create the user",
      error: error.message,
    });
  }
};

// loginUser
const loginUser = async (req, res) => {
  // recive login data
  const { email, password } = req.body;

  // validate input
  if (!email.trim())
    return res.status(400).json({
      success: false,
      message: "Email field can not be empty",
    });

  if (!password.trim())
    return res.status(400).json({
      success: false,
      message: "Password field can not be empty",
    });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid email format" });
  }

  if (password.length < 6)
    return res.status(400).json({
      message: "password must be 6 character",
    });

  // find user
  const isUser = await User.findOne({ email });
  if (!isUser)
    return res.status(404).json({
      success: false,
      message: "User Not Found",
    });

  // verify Password
  const verifyPassword = await isUser.isPasswordCorrect(password);
  if (!verifyPassword)
    return res.status(401).json({
      success: false,
      message: "Invalid credentials ",
    });

  // generate token
  const accessToken = isUser.generateAccessToken();
  const refreshToken = isUser.generateRefreshToken();

  // store refresh token
  isUser.refreshTokens.push(refreshToken);
  await isUser.save({ validateBeforeSave: false });

  // send token to clint
  const option = {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.cookie("accessToken", accessToken, option);
  res.cookie("refreshToken", refreshToken, option);

  // return response
  return res.status(200).json({
    success: true,
    message: "Login Successful",
    user: { userName: isUser.userName },
  });
};

// logout
const logOut = async (req, res) => {
  try {
    if (req.user?._id) {
      await User.findByIdAndUpdate(req.user._id, {
        $unset: { refreshTokens: "" },
      });

      const option = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      };

      res.clearCookie("accessToken", option);
      res.clearCookie("refreshToken", option);

      return res.status(200).json({
        success: true,
        message: "Logout successfull",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error During logOut",
      error: error.message,
    });
  }
};

// forgot password
const forgotPassword = async (req, res) => {
  try {
    // recive data
    const { newPassword, confirmPassword } = req.body;

    // validate data
    if (!newPassword || !confirmPassword)
      return res.status(400).json({
        success: false,
        message: "Password field cannot be empty",
      });

    // confirm  password
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // update the data
    await User.findByIdAndUpdate(req.user._id, {
      $set: { password: hashedPassword },
    });
    return res.status(200).json({
      success: true,
      message: "Password is update successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Not able to change password",
      error: error.message,
    });
  }
};

// change password
const changePassword = async (req, res) => {
  try {
    // recive data
    const { oldPassword, confirmPassword, newPassword } = req.body;

    //  validate data
    if (!oldPassword)
      return res.status(400).json({
        success: true,
        message: "old Password field is cannot be empty",
      });

    if (!confirmPassword)
      return res.status(400).json({
        success: true,
        message: "confirm Password field is cannot be empty",
      });

    if (!newPassword)
      return res.status(400).json({
        success: false,
        message: "New Password field is cannot be empty",
      });

    // find User
    const user = await User.findById(req.user._id);

    // validate user
    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    // match password
    const isMatch = await user.isPasswordCorrect(oldPassword);
    if (!isMatch)
      return res.status(400).json({
        success: false,
        message: "Old Password is incorrect",
      });

    // Confirm new password match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await User.findByIdAndUpdate(req.user._id, {
      $set: { password: hashedPassword },
    });

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "failed to change the password",
      error: error.message,
    });
  }
};

// refresh token
const refreshToken = async (req, res) => {
  // try {
  //   const { token } = req.body;
  //   if (!token) {
  //     return res.status(401).json({
  //       success: false,
  //       message: "Refresh token is required",
  //     });
  //   }
  //   // Verify the refresh token
  //   const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  //   // Check if the user exists and token matches stored one
  //   const user = await User.findById(decoded._id);
  //   if (!user || user.refreshTokens !== token) {
  //     return res.status(403).json({
  //       success: false,
  //       message: "Invalid refresh token",
  //     });
  //   }
  //   // Generate a new refresh token and update DB
  //   const newRefreshToken = user.generateRefreshToken();
  //   user.refreshTokens.push(newRefreshToken);
  //   await user.save();
  //   return res.status(200).json({
  //     success: true,
  //     message: "token genrate sucessfuly"
  //   });
  // } catch (error) {
  //   return res.status(403).json({
  //     success: false,
  //     message: "Invalid or expired refresh token",
  //     error: error.message,
  //   });
  // }
};

export {
  registerUser,
  loginUser,
  logOut,
  forgotPassword,
  changePassword,
  refreshToken,
};
