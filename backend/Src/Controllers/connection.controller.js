import Connection from "../Models/Connection.Model.js";
import User from "../Models/User.Model.js";
import redis from "../redis.js";

//ADD CONNECTION
const addConnection = async (req, res) => {
  try {
    const user = req.user?._id;

    if (!user)
      return res.status(404).json({
        success: false,
        message: "Unauthorized",
      });

    const { email } = req.body;

    if (!email)
      return res.status(400).json({
        success: false,
        message: "Email field cannot be empty",
      });

    const addUser = await User.findOne({ email });

    if (!addUser)
      return res.status(401).json({
        success: false,
        message: `${email} user not found with this email`,
      });

    if (addUser._id.toString() === user.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot add yourself to your connections.",
      });
    }

    await Connection.findOneAndUpdate(
      { owner: user },
      { $addToSet: { connection: addUser._id } },
      { upsert: true, new: true }
    );

    // Delete the old cache so next fetch gets fresh data
    await redis.del(`connections:${user}`);

    return res.status(200).json({
      success: true,
      message: `${email} user added to connection successfully.`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in adding the new connection",
      error: error.message,
    });
  }
};

// FETCH CONNECTION
const fetchConnection = async (req, res) => {
  try {
    const user = req.user?._id;

    if (!user)
      return res.status(404).json({
        success: false,
        message: "Unauthorized",
      });

    // Check Redis Cache
    const cacheKey = `connections:${user}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return res.status(200).json({
        success: true,
        message: "Connections fetched from Redis cache",
        data: JSON.parse(cachedData),
      });
    }

    // Fetch from MongoDB if not in cache
    const response = await Connection.findOne({ owner: user }).populate(
      "connection",
      "fullName email avatar"
    );

    const connections = response?.connection || [];

    // Store in Redis (cache for 1 hour)
    await redis.set(cacheKey, JSON.stringify(connections), { EX: 3600 });

    return res.status(200).json({
      success: true,
      message: "Connections fetched successfully",
      data: connections,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error during fetching the connection",
      error: error.message,
    });
  }
};

export { addConnection, fetchConnection };
