import Message from "../Models/Message.Model.js";

const createMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message)
      return res.status(400).json({
        success: false,
        message: "Message Field cannot be Empty",
      });

    const sender = req.user?._id;

    if (!sender)
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });

    const receiver = req.params.id;

    if (!receiver)
      return res.status(400).json({
        success: false,
        message: "user Not exist",
      });

    const newMessage = await Message.create({
      sender,
      receiver,
      message,
    });

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

export { createMessage, markMessageAsRead };
