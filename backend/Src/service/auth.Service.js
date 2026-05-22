import { ApiError  } from "../Utils/apiErrorHandler.js";
import User from "../Models/User.Model.js";

export const registerUserService = (async ({email, password, userName}) => {
  
     // normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // check existing user
    const existingUser = await User.findOne({
        email: normalizedEmail,
    });

    if(existingUser)
    throw new ApiError(409,"Email is already registered")

})