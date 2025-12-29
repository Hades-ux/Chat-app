import Message from "../Models/Message.Model.js";
import Connection from "../Models/Connection.Model.js";

// CREATE MESSAGE
const createMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message)
      return res.status(400).json({ success: false, message: "Message is required" });

    const receiver = req.params.id;
    const sender = req.user?._id;

    if (!receiver || !sender)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const newMessage = await Message.create({
      sender,
      receiver,
      message,
    });

    const connection = await Connection.findOne({ owner: receiver });

    if (!connection) {
      await Connection.create({
        owner: receiver,
        connection: [sender],
      });
    } else if (!connection.connection.includes(sender)) {
      connection.connection.push(sender);
      await connection.save();
    }

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


// FETCH MESSAGES
const fetchMessage = async (req, res) => {
  try {
    const sender = req.user?._id;
    const { receiver } = req.query;

    if (!sender || !receiver)
      return res.status(400).json({ success: false, message: "Invalid request" });

    const messages = await Message.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
    }).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


//LAST MESSAGE LIST
const getConnectionsWithLastMsg = async (req, res) => {
  try {
    const userId = req.user?._id;

    const connectionDoc = await Connection.findOne({ owner: userId })
      .populate("connection", "fullName avatar email");

    if (!connectionDoc)
      return res.status(200).json({ success: true, data: [] });

    const results = await Promise.all(
      connectionDoc.connection.map(async (conn) => {
        const lastMsg = await Message.findOne({
          $or: [
            { sender: userId, receiver: conn._id },
            { sender: conn._id, receiver: userId },
          ],
        }).sort({ createdAt: -1 });

        return {
          user: conn,
          lastMessage: lastMsg?.message || "",
          lastMessageTime: lastMsg?.createdAt || null,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export {
  createMessage,
  fetchMessage,
  getConnectionsWithLastMsg,
};
