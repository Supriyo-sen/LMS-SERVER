const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("setup", (userData) => {
      if (userData && userData._id) {
        socket.join(userData._id);
        console.log(`User ${socket.id} joined room: ${userData._id}`);
        socket.emit("connected");
      } else {
        console.error(
          "Invalid user data received during socket setup:",
          userData
        );
      }
    });

    socket.on("joinRoom", (room) => {
      socket.join(room);
      console.log(`User ${socket.id} joined room: ${room}`);
    });

    socket.on("typing", (room) => socket.in(room).emit("typing", room));
    socket.on("stop typing", (room) =>
      socket.in(room).emit("stop typing", room)
    );

    socket.on("new message", (newMessageRecieved) => {
      const chat = newMessageRecieved.chat;
      if (!chat.users) return console.error("chat.users not defined");

      chat.users.forEach((user) => {
        if (user._id !== newMessageRecieved.sender._id) {
          socket.to(user._id).emit("message received", newMessageRecieved);
        }
      });

      socket.emit("message received", newMessageRecieved);
    });

    socket.on("message seen", ({ chatId }) => {
      io.in(chatId).emit("message seen", { chatId });
    });

    socket.on("leaveRoom", (room) => {
      socket.leave(room);
      console.log(`User ${socket.id} left room: ${room}`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io is not initialized");
  }
  return io;
};

module.exports = { initSocket, getIO };
