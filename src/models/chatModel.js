const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    chatName: { type: String, trim: true }, // Name of group or "sender" for one-on-one
    isGroupChat: { type: Boolean, default: false },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true }
);

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    content: { type: String, trim: true }, // For text messages
    media: { type: String }, // Media file URLs
    type: {
      type: String,
      enum: ["text", "image", "video", "audio"],
      default: "text",
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = {
  Chat: mongoose.model("Chat", chatSchema),
  Message: mongoose.model("Message", messageSchema),
};
