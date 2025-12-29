import Connection from "../Models/Connection.Model.js";
import User from "../Models/User.Model.js";

// ADD CONNECTION
const addConnection = async (req, res) => {
  try {
    const user = req.user?._id;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email field cannot be empty",
      });
    }

    const addUser = await User.findOne({ email });

    if (!addUser) {
      return res.status(404).json({
        success: false,
        message: `${email} user not found`,
      });
    }

    if (addUser._id.toString() === user.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot add yourself",
      });
    }

    await Connection.findOneAndUpdate(
      { owner: user },
      { $addToSet: { connection: addUser._id } },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: `${email} added to connections successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error adding connection",
      error: error.message,
    });
  }
};

// FETCH CONNECTION
const fetchConnection = async (req, res) => {
  try {
    const user = req.user?._id;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const response = await Connection.findOne({ owner: user }).populate(
      "connection",
      "fullName email avatar"
    );

    const connections = response?.connection || [];

    return res.status(200).json({
      success: true,
      message: "Connections fetched successfully",
      data: connections,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching connections",
      error: error.message,
    });
  }
};

export { addConnection, fetchConnection };
