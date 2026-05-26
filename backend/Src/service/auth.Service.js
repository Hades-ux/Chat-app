import { ApiError  } from "../Utils/apiErrorHandler.js";
import User from "../Models/User.Model.js";
import jwt from "jsonwebtoken";

//for register(sign up) User
const registerUserService = async ({ email, password, fullName }) => {
  
     // normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // check existing user
    const existingUser = await User.findOne({
        email: normalizedEmail,
    });

    if(existingUser){
        throw new ApiError(409,"Email is already registered");
    }

    const userData = {
        fullName: fullName,
        password: password,
        email: normalizedEmail,
    };

    const creatUser = await User.create(userData);

    return creatUser;

};

//for login user
const loginUserService = async({ email, password }) => {

     // normalize email
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if(!user){   
        throw new ApiError(404,"User not found");
    }

    const isMatch = await user.isPasswordCorrect(password);

    if(!isMatch){
        throw new ApiError(401,"Invalid credentials");
    }

      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();

      const safeUser = user.toObject();
      delete safeUser.password
    
      return {
        safeUser,
        accessToken,
        refreshToken,
    }

};

//for refresh token rotation
const refreshTokenService = async({ token }) => {

    if(!token){
        throw new ApiError(401, "Refresh token is missing");
    }

    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decoded?._id)

    if(!user){
        throw new ApiError(401, "User not found");
    }

    if(token != user.refreshToken){
        throw new ApiError(403, "Invalid or expired refresh token");
    }

    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    return{
        newAccessToken,
        newRefreshToken
    }

};

export { registerUserService, loginUserService, refreshTokenService, }