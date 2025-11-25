import Connection from "../Models/Connection.Model.js";
import User from "../Models/User.Model.js";

const addConnection = async (req, res) => {
  try {
    const user = req.user?._id;

    if (!user)
      return res.status(404).json({
        success: false,
        message: "Unauthorized",
      });

    //   email is use to add the user
    const { userEmail } = req.body;

    if (!userEmail)
      return res.status(400).json({
        success: false,
        message: "Email field can not be empty",
      });

    const addUser = await User.findOne({ email: userEmail });

    if (!addUser)
      return res.status(401).json({
        success: false,
        message: `${userEmail} User not found with this email`,
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
    return res.status(200).json({
      success: true,
      message: `${userEmail} user added to connection successfully `,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in adding the new connection",
      error: error.message,
    });
  }
};

const fetchConnection = async (req, res) => {
  try {
    const user = req.user?._id;

    if (!user)
      return res.status(404).json({
        success: false,
        message: "Unauthorized",
      });

    const response = await Connection.findOne({owner: req.user._id}).populate("connection", "firstName email avatar messages")
    return res.status(200).json({
      success: true,
      message: 'connection fetch successfully',
      data: response?.connection ?? [],
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
