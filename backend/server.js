import app from "./app.js";
import connectDB from "./Src/DB/dataBase.js";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import redis from "./Src/redis.js";
import "dotenv/config";

const PORT = process.env.PORT || 4444;
const allowedOrigins = [
  "https://chat-app-six-delta-19.vercel.app",
];

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

// initialize socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// SOCKET.IO
io.on("connection", async (socket) => {
  console.log(" NEW CLIENT CONNECTED:", socket.id);

  // Extract userId from query (sent by client)
  const userId = socket.handshake.query.userId;
  if (!userId) {
    console.log("No userId provided in socket connection");
    return;
  }

  const userKey = `user:${userId}:online`;

  // Mark User as ONLINE in Redis
  await redis.set(userKey, "online", { EX: 60 });
  await redis.sAdd(`user:${userId}:sockets`, socket.id);

  // Notify other users
  io.emit("userOnline", { userId });

  console.log(`User ${userId} is ONLINE`);

  // Auto-refresh online status every 40 secs (renew TTL)
  const interval = setInterval(async () => {
    await redis.set(userKey, "online", { EX: 60 });
  }, 40000);

  // JOIN PERSONAL CHAT ROOM
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`${socket.id} joined room → ${roomId}`);
  });

  // SEND MESSAGE
  socket.on("sendMessage", (data) => {
    const { sender, receiver, message } = data;

    if (!sender || !receiver || !message) return;

    const roomId = [sender, receiver].sort().join("_");

    io.to(roomId).emit("receiveMessage", {
      sender,
      message,
      timeStamp: new Date(),
    });
  });

  // TYPING
  socket.on("Typing", (data) => {
    const { sender, receiver, isTyping } = data;
    if (!sender || !receiver) return;

    const roomId = [sender, receiver].sort().join("_");

    socket.to(roomId).emit("Typing", {
      sender,
      isTyping,
    });
  });

  // ON DISCONNECT
  socket.on("disconnect", async () => {
    console.log(" CLIENT DISCONNECTED:", socket.id);

    // Remove socket from Redis
    await redis.sRem(`user:${userId}:sockets`, socket.id);
    const remaining = await redis.sCard(`user:${userId}:sockets`);

    if (remaining === 0) {
      // No active sockets → user is offline
      await redis.del(userKey);
      io.emit("userOffline", { userId });
      console.log(`User ${userId} is OFFLINE`);
    }

    clearInterval(interval);
  });
});

// START SERVER
server.listen(PORT, () => {
  console.log(`\nServer running: http://localhost:${PORT}`);
});
