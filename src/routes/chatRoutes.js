const express = require("express");
const {
  accessChat,
  fetchChats,
  sendMessage,
  markMessagesAsRead,
  deleteMessage,
  updateMessage,
  allMessages,
} = require("../controllers/chatController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../config/multer");

const router = express.Router();

router.post("/", protect, accessChat); // Access or create one-on-one chat
router.get("/", protect, fetchChats); // Get all chats for user
router.post("/message", protect, upload.single("media", 5), sendMessage); // Send a message
router.get("/:chatId", protect, allMessages); // Get all messages in a chat
router.put("/:chatId/mark-read", protect, markMessagesAsRead); // Mark messages as read
router.delete("/:messageId", protect, deleteMessage); // Delete a message
router.put("/:messageId", protect, updateMessage); // Update a message

module.exports = router;
