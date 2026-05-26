import { ApiError  } from "../Utils/apiErrorHandler.js";
import User from "../Models/User.Model.js";

export const registerUserService = async ({ email, password, fullName }) => {
  
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

}

export const loginUserService = async({ email, password }) => {

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

    }