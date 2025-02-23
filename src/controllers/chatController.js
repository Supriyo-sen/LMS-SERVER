const { Chat, Message } = require("../models/chatModel");
const User = require("../models/userModel");
const { getIO } = require("../config/socket");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "UserId is required" });
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    console.error("Invalid UserId format:", userId);
    return res.status(400).json({ message: "Invalid UserId format" });
  }

  try {
    const userObjectId = mongoose.Types.ObjectId.createFromHexString(userId);

    const existingChat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [req.user._id, userObjectId] },
    })
      .populate("users", "-password")
      .populate("latestMessage");

    if (existingChat) {
      return res.status(200).json(existingChat);
    }

    const chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userObjectId],
    };

    const newChat = await Chat.create(chatData);
    const fullChat = await Chat.findById(newChat._id).populate(
      "users",
      "-password"
    );

    res.status(201).json(fullChat);
  } catch (error) {
    console.error("Error during ObjectId conversion:", error);
    return res
      .status(400)
      .json({ message: "Invalid UserId", error: error.message });
  }
});

const fetchChats = asyncHandler(async (req, res) => {
  try {
    const chats = await Chat.find({ users: req.user._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching chats", error: error.message });
  }
});

const sendMessage = asyncHandler(async (req, res) => {
  const { chatId, content, type } = req.body;

  if (!chatId || (!content && !req.file)) {
    return res
      .status(400)
      .json({ message: "Chat ID and content or media are required" });
  }

  let mediaUrl = null;
  let messageType = "text";

  if (req.file) {
    mediaUrl = req.file.path;
    const mimeType = req.file.mimetype.split("/")[0];
    messageType =
      mimeType === "audio" ? "audio" : mimeType === "image" ? "image" : "video";
  }

  const messageData = {
    sender: req.user._id,
    content,
    media: mediaUrl,
    type: type || (req.file ? "media" : "text"),
    chat: chatId,
  };

  try {
    let message = await Message.create(messageData);

    message = await message.populate("sender", "name email");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name email",
    });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    res.status(201).json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name email role")
      .populate("chat");
    res.status(200).json(messages);
  } catch (error) {
    res.status(400);
    throw new Error("Error occured while fetching messages");
  }
});

// Mark all messages in a room as read
const markMessagesAsRead = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  try {
    const messagesToUpdate = await Message.find({
      chat: chatId,
      isRead: false,
    });

    if (messagesToUpdate.length === 0) {
      return res.status(200).json({ message: "No unread messages found." });
    }

    const result = await Message.updateMany(
      { chat: chatId, isRead: false },
      { $set: { isRead: true } }
    );

    const io = getIO();
    io.in(chatId).emit("message seen", { chatId });

    res.status(200).json({
      message: "Messages marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error marking messages as read",
      error: error.message,
    });
  }
});

// Delete a message
const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  try {
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (
      message.sender.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await message.deleteOne();
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting message", error: error.message });
  }
});

// Update a message
const updateMessage = async (req, res) => {
  const { id } = req.params;
  const { message, media, type } = req.body;

  try {
    const chatMessage = await Chat.findById(id);

    if (!chatMessage)
      return res.status(404).json({ message: "Message not found" });

    if (
      chatMessage.sender.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    chatMessage.message = message || chatMessage.message;
    chatMessage.media = media || chatMessage.media;
    chatMessage.type = type || chatMessage.type;
    await chatMessage.save();

    res.status(200).json(chatMessage);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating message", error: err.message });
  }
};

module.exports = {
  accessChat,
  fetchChats,
  sendMessage,
  allMessages,
  markMessagesAsRead,
  deleteMessage,
  updateMessage,
};
