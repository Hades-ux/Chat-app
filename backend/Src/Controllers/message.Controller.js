import Message from "../Models/Message.Model.js";
import Connection from "../Models/Connection.Model.js";
import redis from "../redis.js";

// CREATE MESSAGE
const createMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message)
      return res.status(400).json({ success: false, message: "Message is required" });

    const receiver = req.params.id;
    if (!receiver)
      return res.status(400).json({ success: false, message: "Receiver is required" });

    const sender = req.user?._id;
    if (!sender)
      return res.status(401).json({ success: false, message: "Unauthorized user" });

    // Create message
    const newMessage = await Message.create({
      sender,
      receiver,
      message,
    });

    // ⭐ Invalidate chat cache for both users
    await redis.del(`chat:${sender}:${receiver}`);
    await redis.del(`chat:${receiver}:${sender}`);

    // ⭐ Invalidate last message cache
    await redis.del(`lastmsg:${sender}`);
    await redis.del(`lastmsg:${receiver}`);

    // Add sender to receiver’s connection only if not present
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
    if (!sender)
      return res.status(400).json({ success: false, message: "User not found" });

    const { receiver } = req.query;
    if (!receiver)
      return res.status(400).json({ success: false, message: "Receiver not found" });

    const cacheKey = `chat:${sender}:${receiver}`;

    // Try Redis first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        fromCache: true,
        data: JSON.parse(cached),
      });
    }

    // Fetch from MongoDB
    const messages = await Message.find({
      $or: [
        { sender: sender, receiver: receiver },
        { sender: receiver, receiver: sender },
      ],
    }).sort({ createdAt: 1 });

    // Store in Redis
    await redis.set(cacheKey, JSON.stringify(messages), { EX: 3600 });

    return res.status(200).json({ success: true, data: messages });
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

    const cacheKey = `lastmsg:${userId}`;

    // Check Redis cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        fromCache: true,
        data: JSON.parse(cached),
      });
    }

    const connectionDoc = await Connection.findOne({ owner: userId })
      .populate("connection", "fullName avatar email");

    if (!connectionDoc)
      return res.status(200).json({ success: true, data: [] });

    const connections = connectionDoc.connection;

    // Fetch last message for each user
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

    // Store in Redis (expires in 5 minutes)
    await redis.set(cacheKey, JSON.stringify(results), { EX: 300 });

    return res.status(200).json({ success: true, data: results });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export {
  createMessage,
  fetchMessage,
  getConnectionsWithLastMsg,
};
