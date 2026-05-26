import { ApiError  } from "../Utils/apiErrorHandler.js";
import User from "../Models/User.Model.js";

export const registerUserService = async ({email, password, fullName}) => {
  
     // normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // check existing user
    const existingUser = await User.findOne({
        email: normalizedEmail,
    });

    if(existingUser)
    throw new ApiError(409,"Email is already registered");

    const userData = {
        fullName: fullName,
        password: password,
        email: normalizedEmail,
    };

    const creatUser = await User.create(userData);

    return creatUser;

}