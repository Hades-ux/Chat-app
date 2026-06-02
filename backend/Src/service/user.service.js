import ApiError from "../Utils/ApiError.js";
import User from "../Models/User.Model.js";

const ownerProfileService = async ({ userId }) => {
  if (!userId) {
    throw new ApiError(400, "Unauthorized request");
  }

  const currentUser = await User.findById(userId)
    .select("fullName email createdAt isVerified avatar _id")
    .lean();

  if (!currentUser) {
    throw new ApiError(404, "User not found");
  }

  return currentUser;
};

export { ownerProfileService };
