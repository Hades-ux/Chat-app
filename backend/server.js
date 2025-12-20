import app from "./app.js";
import connectDB from "./Src/DB/dataBase.js";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import redis from "./Src/redis.js";
import "dotenv/config";

const PORT = process.env.PORT || 4444;
const allowedOrigins = ["http://localhost:5173"];

// Connect database & Redis
await redis.connect();
await connectDB();

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

const server = http.createServer(app);
const onlineUsers = new Map();

// initialize socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingInterval: 20000, // default 20s
  pingTimeout: 5000, // default 5s
});

// SOCKET.IO
io.on("connection", async (socket) => {
  console.log("NEW CLIENT CONNECTED");

  socket.on("setup", (user) => {
    socket.user = user;
    socket.join(user);

    const count = onlineUsers.get(user) || 0;
    onlineUsers.set(user, count + 1);

    // Emit only when first socket connects
    if (count === 0) {
      io.emit("userOnline", user);
    }
  });

  socket.on("joinRoom", (chatId) => {
    socket.join(chatId);
    console.log("Chat Room is joined");
  });

  socket.on("sendMessage", async (data) => {
    console.log(data);
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
    console.log("Chat Room is left");
  });

  // ON DISCONNECT
  socket.on("disconnect", async () => {
    const user = socket.user;
    if (!user) return;

    const count = onlineUsers.get(user) || 0;

    if (count <= 1) {
      onlineUsers.delete(user);
      io.emit("userOffline", user);
    } else {
      onlineUsers.set(user, count - 1);
    }
    console.log("CLIENT DISCONNECTED\n");
  });

  // START SERVER
});
server.listen(PORT, () => {
  console.log(`\nServer running: http://localhost:${PORT}`);
});
