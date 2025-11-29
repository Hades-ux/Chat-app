import Message from "../Models/Message.Model.js";
import Connection from "../Models/Connection.Model.js";

const createMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const receiver = req.params.id;

    if (!receiver) {
      return res.status(400).json({
        success: false,
        message: "Receiver is required",
      });
    }

    const sender = req.user?._id;
    if (!sender) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    // Create message
    const newMessage = await Message.create({
      sender,
      receiver,
      message,
    });

    // Add sender to receiver's connection list — only AFTER sending message
    // Safely update connections
    const connection = await Connection.findOne({ owner: receiver });
    if (!connection) {
      // If no connection document exists, create one
      await Connection.create({
        owner: receiver,
        connection: [sender],
      });
    } else if (!connection.connection.includes(sender)) {
      // Only add sender if not already in array
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

const markMessageAsRead = async (req, res) => {
  try {
    const sender = req.params.receiver_id;

    if (!sender)
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });

    const receiver = req.body._id;

    if (!receiver)
      return res.status(400).json({
        success: false,
        message: "user Not exist",
      });

    await Message.updateMany(
      { sender, receiver, read: false },
      { $set: { read: true } }
    );
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const fetchMessage = async (req, res) => {
  try {
    const sender = req.user?._id;
    if (!sender)
      return res.status(400).json({
        success: false,
        message: "user  Not exist",
      });

    const { receiver } = req.query;
    if (!receiver)
      return res.status(400).json({
        success: false,
        message: "receiver Not exist",
      });

    // Fetch chat between two users (both ways)
    const message = await Message.find({
      $or: [
        { sender: sender, receiver: receiver },
        { sender: receiver, receiver: sender },
      ],
    }).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getConnectionsWithLastMsg = async (req, res) => {
  try {
    const userId = req.user?._id;

    const connectionDoc = await Connection.findOne({ owner: userId })
      .populate("connection", "fullName")
      .exec();

    if (!connectionDoc) {
      return res.status(200).json({ success: true, data: [] });
    }

    const connections = connectionDoc.connection;

    // Use Promise.all to wait for all async operations
    const results = await Promise.all(
      connections.map(async (conn) => {
        const lastMsg = await Message.findOne({
          $or: [
            { sender: userId, receiver: conn._id },
            { sender: conn._id, receiver: userId },
          ],
        })
          .sort({ createdAt: -1 })
          .exec();

        return {
          user: conn,
          lastMessage: lastMsg?.message || "",
          lastMessageTime: lastMsg?.createdAt || null,
        };
      })
    );

    return res.status(200).json({ success: true, data: results });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export {
  createMessage,
  markMessageAsRead,
  fetchMessage,
  getConnectionsWithLastMsg,
};
