import app from "./app.js";
import connectDB from "./Src/DB/dataBase.js";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import redis from "./Src/redis.js";
import "dotenv/config";

const PORT = process.env.PORT || 4444;
const allowedOrigins = [
  process.env.DEV_CLIENT,
  process.env.PROD_CLIENT,
];

// Connect database & Redis
await redis.connect();
await connectDB();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Postman / mobile

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

const server = http.createServer(app);
const onlineUsers = new Set();

// initialize socket.io
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingInterval: 20000,
  pingTimeout: 5000,
});

// SOCKET.IO
io.on("connection", async (socket) => {
  socket.on("setup", (user) => {
    socket.user = user;
    socket.join(user);

    if (!onlineUsers.has(user)) {
      onlineUsers.add(user);
      io.emit("userOnline", user);
    }
  });

  socket.on("getOnlineUser", (userId) => {
    if (onlineUsers.has(userId)) {
      socket.emit("userOnline", userId);
    } else {
      socket.emit("userOffline", userId);
    }
  });

  socket.on("joinRoom", (chatId) => {
    socket.join(chatId);
  });

  socket.on("sendMessage", async (data) => {
    io.to(data.chatId).emit("receiveMessage", data);
  });

  socket.on("typing", (chatId) => {
    socket.to(chatId).emit("userTyping");
  });

  socket.on("noTyping", (chatId) => {
    socket.to(chatId).emit("userStoppedTyping");
  });

  socket.on("leaveRoom", (chatId) => {
    socket.leave(chatId);
  });

  // ON DISCONNECT
  socket.on("disconnect", async () => {
    if (!socket.user) return;

    onlineUsers.delete(socket.user);
    io.emit("userOffline", socket.user);
  });

  // START SERVER
});
server.listen(PORT, () => {
  console.log(`\nServer running: http://localhost:${PORT}`);
});
