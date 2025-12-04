import bcrypt from "bcrypt";
import User from "../Models/User.Model.js";
import { registerValidation } from "../validation/auth.validation.js";

// register
const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // 1. VALIDATE
    const errorMessage = registerValidation({ fullName, email, password });
    if (errorMessage) {
      return res.status(400).json({ success: false, message: errorMessage });
    }

    // 2. CHECK IF EMAIL EXISTS
    const normalizedEmail = email.toLowerCase();
    const emailTaken = await User.findOne({ email:normalizedEmail });

    if (emailTaken) {
      return res.status(409).json({
        success: false,
        message: `${emailTaken.email} is already registered`,
      });
    }

    // 3. CREATE USER
    await User.create({
      fullName: fullName.toLowerCase(),
      email: normalizedEmail,
      password,
    });

    return res.status(201).json({
      success: true,
      message: `${fullName} user has been created`,
    });
  } catch (error) {
     if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: `${error} is already registered`,
      });
    }
    return res.status(500).json({
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
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.cookie("accessToken", accessToken, option);
  res.cookie("refreshToken", refreshToken, option);

  // return response
  return res.status(200).json({
    success: true,
    message: "Login Successful",
    user: { userName: isUser.userName, id: isUser._id },
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
