import Connection from "../Models/Connection.Model.js";
import User from "../Models/User.Model.js";
import ApiError from "../Utils/ApiError.js";

//for adding connection
const addConnectionService = async ({ userId, email }) => {
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  if (!email) {
    throw new ApiError(400, "Email is missing");
  }

  const normalizeEmail = email.trim().toLowerCase();

  const targetUser = await User.findOne({ email: normalizeEmail })
    .select("_id")
    .lean();

  if (!targetUser) {
    throw new ApiError(404, `User with email: ${email} not found.`);
  }

  if (userId.toString() === targetUser._id.toString()) {
    throw new ApiError(400, "You cannot add yourself");
  }

  try {
    await Connection.findOneAndUpdate(
      { owner: userId },
      { $addToSet: { connections: targetUser._id } },
      { upsert: true }
    );
    return true;
  } catch (error) {
    console.error("Not able to add user", error);
    throw new ApiError(503, "Service unavailable");
  }
};

// fetching the connection
const fetchConnectionService = async ({ userId }) => {
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const response = await Connection.findOne({ owner: userId })
    .populate("connections", "fullName email avatar")
    .lean();

  const connections = response?.connections || [];

  return {
    data: connections,
  };
};
export { addConnectionService, fetchConnectionService };
