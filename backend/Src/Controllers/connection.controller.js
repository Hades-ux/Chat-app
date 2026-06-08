import {
  addConnectionService,
  fetchConnectionService,
} from "../service/connection.Service.js";
import ApiResponse from "../Utils/ApiResponse.js";

// ADD CONNECTION
const addConnection = async (req, res) => {
  const userId = req.user?._id;
  const { email } = req.body;

  await addConnectionService(userId, email);

  return res
    .status(200)
    .json(new ApiResponse(`User ${email}added to connections successfully`));
};

// FETCH CONNECTION
const fetchConnection = async (req, res) => {
  const userId = req.user?._id;

  const response = await fetchConnectionService({ userId });

  return res
    .status(200)
    .json(new ApiResponse("Connections fetched successfully", response.data));
};

export { addConnection, fetchConnection };
